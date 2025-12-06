import os
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
import os
import uuid
from django.conf import settings
from . import models
from .models import (
    Department, UserProfile, Printer, UserPrinterAssignment,
    PricingConfig, UserPricingProfile, PrintJob, SystemLog,
    JobStatus, PrinterStatus, UserRole, MaterialType, PrinterType,
)
from .models import LogAction
from django.core.files.storage import default_storage
from .serializers import *
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer, CurrentUserSerializer,
    DepartmentSerializer, UserProfileSerializer, SimpleUserProfileSerializer
)
import logging

logger = logging.getLogger(__name__)


# ====================
# PERMISSION CLASSES
# ====================

class IsAdminOrReadOnly(permissions.BasePermission):
    """Permite escritura solo a administradores"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permite acceso al dueño o administrador"""
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        
        # Para objetos que tienen relación con User
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        return False


class IsAdminOrTechnician(permissions.BasePermission):
    """Permite acceso a administradores o técnicos"""
    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
        
        try:
            profile = request.user.profile
            return profile.role in [UserRole.TECHNICIAN, UserRole.ADMIN]
        except UserProfile.DoesNotExist:
            return False


# ====================
# VIEWSETS
# ====================

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar usuarios"""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'email', 'date_joined']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'me':
            return CurrentUserSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]  # Cualquiera puede registrarse
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtiene información del usuario actual"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def set_password(self, request, pk=None):
        """Cambia la contraseña del usuario"""
        user = self.get_object()
        if user != request.user and not request.user.is_staff:
            return Response(
                {"detail": "No tienes permiso para cambiar esta contraseña"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"old_password": ["Contraseña incorrecta"]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"detail": "Contraseña cambiada correctamente"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileUpdateView(APIView):
    """Vista específica para actualizar perfil de usuario"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request):
        user = request.user
        
        # Usar el serializer de actualización
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            
            # Si hay datos de perfil, actualizarlos también
            profile_data = {}
            if 'phone' in request.data:
                profile_data['phone'] = request.data['phone']
            if 'address' in request.data:
                profile_data['address'] = request.data['address']
            if 'student_id' in request.data:
                profile_data['student_id'] = request.data['student_id']
            
            if profile_data:
                try:
                    profile = user.profile
                    profile_serializer = SimpleUserProfileSerializer(
                        profile, 
                        data=profile_data, 
                        partial=True
                    )
                    if profile_serializer.is_valid():
                        profile_serializer.save()
                except UserProfile.DoesNotExist:
                    pass
            
            # Devolver usuario actualizado
            updated_user = User.objects.get(id=user.id)
            response_serializer = CurrentUserSerializer(updated_user)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DepartmentViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar departamentos"""
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['name', 'code', 'created_at']


class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar perfiles de usuario"""
    queryset = UserProfile.objects.all().select_related('user', 'department')
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'user__email', 'student_id', 'phone']
    ordering_fields = ['user__username', 'role', 'created_at']
    
    def get_queryset(self):
        """Filtra los perfiles según permisos"""
        queryset = super().get_queryset()
        
        # Si no es admin, solo ve su propio perfil
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        
        # Filtro por rol
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        # Filtro por departamento
        department_id = self.request.query_params.get('department', None)
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        # Filtro por verificación
        is_verified = self.request.query_params.get('is_verified', None)
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verifica un perfil de usuario (solo admin)"""
        if not request.user.is_staff:
            return Response(
                {"detail": "Solo administradores pueden verificar usuarios"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        profile = self.get_object()
        profile.is_verified = True
        profile.save()
        
        # Crear log
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.UPDATE,
            model_name='UserProfile',
            object_id=profile.id,
            description=f"Usuario verificado por {request.user.username}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({"detail": "Usuario verificado correctamente"})
    
    def get_client_ip(self, request):
        """Obtiene la IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PrinterViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar impresoras"""
    queryset = Printer.objects.all().select_related('department')
    serializer_class = PrinterSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTechnician]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'serial_number', 'brand', 'model', 'location']
    ordering_fields = ['name', 'status', 'created_at']
    
    def get_queryset(self):
        """Filtra las impresoras según permisos y parámetros"""
        queryset = super().get_queryset()
        
        # Filtro por estado
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtro por tipo
        printer_type = self.request.query_params.get('type', None)
        if printer_type:
            queryset = queryset.filter(printer_type=printer_type)
        
        # Filtro por departamento
        department_id = self.request.query_params.get('department', None)
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        # Filtro por disponibilidad
        available_only = self.request.query_params.get('available', None)
        if available_only and available_only.lower() == 'true':
            queryset = queryset.filter(status__in=['AVA', 'RES'])
        
        # Filtro por necesidad de mantenimiento
        needs_maintenance = self.request.query_params.get('needs_maintenance', None)
        if needs_maintenance is not None:
            if needs_maintenance.lower() == 'true':
                queryset = queryset.filter(total_print_hours__gte=models.F('maintenance_interval_hours'))
            else:
                queryset = queryset.filter(total_print_hours__lt=models.F('maintenance_interval_hours'))
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PrinterDetailSerializer
        return PrinterSerializer
    
    @action(detail=True, methods=['post'])
    def start_maintenance(self, request, pk=None):
        """Pone la impresora en mantenimiento"""
        printer = self.get_object()
        printer.status = PrinterStatus.MAINTENANCE
        printer.save()
        
        # Crear log
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.UPDATE,
            model_name='Printer',
            object_id=printer.id,
            description=f"Impresora puesta en mantenimiento por {request.user.username}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({"detail": "Impresora puesta en mantenimiento"})
    
    @action(detail=True, methods=['post'])
    def complete_maintenance(self, request, pk=None):
        """Completa el mantenimiento de la impresora"""
        printer = self.get_object()
        printer.status = PrinterStatus.AVAILABLE
        printer.total_print_hours = 0  # Reiniciar contador
        printer.save()
        
        # Crear log
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.UPDATE,
            model_name='Printer',
            object_id=printer.id,
            description=f"Mantenimiento completado por {request.user.username}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({"detail": "Mantenimiento completado"})
    
    def get_client_ip(self, request):
        """Obtiene la IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserPrinterAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar asignaciones usuario-impresora"""
    queryset = UserPrinterAssignment.objects.all().select_related('user', 'printer', 'created_by')
    serializer_class = UserPrinterAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTechnician]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = ['start_date', 'end_date', 'created_at']
    
    def get_queryset(self):
        """Filtra las asignaciones según permisos"""
        queryset = super().get_queryset()
        
        # Si no es admin/tecnico, solo ve sus propias asignaciones
        if not (self.request.user.is_staff or 
                (hasattr(self.request.user, 'profile') and 
                 self.request.user.profile.role in ['TEC', 'ADM'])):
            queryset = queryset.filter(user=self.request.user)
        
        # Filtro por usuario
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtro por impresora
        printer_id = self.request.query_params.get('printer', None)
        if printer_id:
            queryset = queryset.filter(printer_id=printer_id)
        
        # Filtro por estado activo
        active = self.request.query_params.get('active', None)
        if active is not None:
            queryset = queryset.filter(active=active.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        """Guarda la asignación con el usuario que la creó"""
        serializer.save(created_by=self.request.user)
        
        # Crear log
        assignment = serializer.instance
        SystemLog.objects.create(
            user=self.request.user,
            action=LogAction.CREATE,
            model_name='UserPrinterAssignment',
            object_id=assignment.id,
            description=f"Asignación creada: {assignment.user.username} - {assignment.printer.name}",
            ip_address=self.get_client_ip(self.request)
        )
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Desactiva una asignación"""
        assignment = self.get_object()
        assignment.deactivate()
        assignment.save()
        
        # Crear log
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.UPDATE,
            model_name='UserPrinterAssignment',
            object_id=assignment.id,
            description=f"Asignación desactivada por {request.user.username}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({"detail": "Asignación desactivada"})
    
    def get_client_ip(self, request):
        """Obtiene la IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PricingConfigViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar configuraciones de precios"""
    queryset = PricingConfig.objects.all().order_by('-valid_from')
    serializer_class = PricingConfigSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'valid_from', 'created_at']
    
    def get_queryset(self):
        """Filtra configuraciones activas"""
        queryset = super().get_queryset()
        
        # Filtro por configuración activa
        active_only = self.request.query_params.get('active', None)
        if active_only and active_only.lower() == 'true':
            queryset = queryset.filter(active=True)
        
        # Filtro por configuración actualmente válida
        currently_valid = self.request.query_params.get('currently_valid', None)
        if currently_valid and currently_valid.lower() == 'true':
            now = timezone.now()
            queryset = queryset.filter(
                active=True,
                valid_from__lte=now
            ).filter(
                Q(valid_to__isnull=True) | Q(valid_to__gte=now)
            )
        
        return queryset


class UserPricingProfileViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar perfiles de precios de usuario"""
    queryset = UserPricingProfile.objects.all().select_related('user', 'pricing_config')
    serializer_class = UserPricingProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'user__email']
    ordering_fields = ['balance', 'credit_limit', 'created_at']
    
    def get_queryset(self):
        """Filtra perfiles según permisos"""
        queryset = super().get_queryset()
        
        # Si no es admin, solo ve su propio perfil
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        
        # Filtro por saldo negativo
        negative_balance = self.request.query_params.get('negative_balance', None)
        if negative_balance and negative_balance.lower() == 'true':
            queryset = queryset.filter(balance__lt=0)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtiene el perfil de precios del usuario actual"""
        try:
            profile = UserPricingProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserPricingProfile.DoesNotExist:
            # Crear perfil automáticamente si no existe
            try:
                profile = UserPricingProfile.objects.create(user=request.user)
                serializer = self.get_serializer(profile)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {"detail": f"Error creando perfil de precios: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
    
    @action(detail=False, methods=['get'])
    def my_balance(self, request):
        """Obtiene solo el saldo del usuario actual (endpoint rápido)"""
        try:
            profile = UserPricingProfile.objects.get(user=request.user)
            response_data = {
                'balance': float(profile.balance),
                'credit_limit': float(profile.credit_limit),
                'available_credit': float(profile.available_credit),
                'total_spent': float(profile.total_spent),
                'last_payment_date': profile.last_payment_date,
            }
            
            # Agregar información de configuración de precios si existe
            if profile.pricing_config:
                response_data['pricing_config'] = {
                    'name': profile.pricing_config.name,
                    'cost_per_hour': float(profile.pricing_config.cost_per_hour),
                    'cost_per_gram': float(profile.pricing_config.cost_per_gram),
                    'student_discount': float(profile.pricing_config.student_discount),
                    'teacher_discount': float(profile.pricing_config.teacher_discount),
                }
            
            # Calcular estadísticas rápidas de impresión
            print_jobs = PrintJob.objects.filter(user=request.user, status='COM')
            if print_jobs.exists():
                response_data['print_stats'] = {
                    'completed_jobs': print_jobs.count(),
                    'total_hours': sum(job.actual_hours or 0 for job in print_jobs),
                    'total_material': sum(job.material_weight or 0 for job in print_jobs),
                    'total_spent_printing': sum(float(job.actual_cost or 0) for job in print_jobs),
                }
            
            return Response(response_data)
        except UserPricingProfile.DoesNotExist:
            # Crear perfil automáticamente si no existe
            profile = UserPricingProfile.objects.create(user=request.user)
            return Response({
                'balance': 0.0,
                'credit_limit': float(profile.credit_limit),
                'available_credit': float(profile.credit_limit),
                'total_spent': 0.0,
                'print_stats': {
                    'completed_jobs': 0,
                    'total_hours': 0,
                    'total_material': 0,
                    'total_spent_printing': 0,
                }
            })
    
    @action(detail=False, methods=['get'])
    def quick_info(self, request):
        """Información rápida para mostrar en el dashboard"""
        try:
            profile = UserPricingProfile.objects.get(user=request.user)
            
            # Trabajos activos del usuario
            active_jobs = PrintJob.objects.filter(
                user=request.user,
                status__in=['APP', 'PRI', 'PAU']
            ).count()
            
            return Response({
                'balance': float(profile.balance),
                'available_credit': float(profile.available_credit),
                'has_negative_balance': profile.balance < 0,
                'active_jobs': active_jobs,
                'can_print': profile.balance < profile.credit_limit and active_jobs < 3,
                'currency_symbol': 'CUP',
            })
        except UserPricingProfile.DoesNotExist:
            return Response({
                'balance': 0.0,
                'available_credit': 1000.0,
                'has_negative_balance': False,
                'active_jobs': 0,
                'can_print': True,
                'currency_symbol': 'CUP',
            })
    
    @action(detail=True, methods=['post'])
    def add_balance(self, request, pk=None):
        """Agrega saldo al perfil de precios"""
        profile = self.get_object()
        
        # Verificar permisos
        if not (request.user.is_staff or request.user == profile.user):
            return Response(
                {"detail": "No tienes permiso para modificar este saldo"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        amount = request.data.get('amount')
        if not amount:
            return Response(
                {"amount": ["Este campo es requerido"]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError("El monto debe ser positivo")
        except (ValueError, TypeError):
            return Response(
                {"amount": ["Debe ser un número positivo"]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Límite máximo de recarga
        max_recharge = 10000  # 10,000 CUP máximo por recarga
        if amount > max_recharge:
            return Response(
                {"amount": [f"El monto máximo por recarga es {max_recharge} CUP"]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Agregar saldo
        old_balance = float(profile.balance)
        profile.add_balance(amount)
        new_balance = float(profile.balance)
        
        # Crear log detallado
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.PAYMENT,
            model_name='UserPricingProfile',
            object_id=profile.id,
            description=f"Recarga de {amount} CUP realizada por {request.user.username}",
            before_data={'balance': old_balance},
            after_data={'balance': new_balance},
            ip_address=self.get_client_ip(request)
        )
        
        return Response({
            "detail": f"Saldo agregado: {amount} CUP",
            "new_balance": new_balance,
            "old_balance": old_balance,
            "added_amount": amount,
        })
    
    @action(detail=False, methods=['post'])
    def recharge_my_account(self, request):
        """Recarga la cuenta del usuario actual"""
        try:
            profile = UserPricingProfile.objects.get(user=request.user)
        except UserPricingProfile.DoesNotExist:
            profile = UserPricingProfile.objects.create(user=request.user)
        
        amount = request.data.get('amount')
        if not amount:
            return Response(
                {"amount": ["Este campo es requerido"]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError
        except ValueError:
            return Response(
                {"amount": ["Debe ser un número positivo"]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_balance = float(profile.balance)
        profile.add_balance(amount)
        new_balance = float(profile.balance)
        
        # Crear log
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.PAYMENT,
            model_name='UserPricingProfile',
            object_id=profile.id,
            description=f"Auto-recarga de {amount} CUP",
            before_data={'balance': old_balance},
            after_data={'balance': new_balance},
            ip_address=self.get_client_ip(request)
        )
        
        return Response({
            "detail": f"Recarga exitosa de {amount} CUP",
            "new_balance": new_balance,
            "old_balance": old_balance,
        })
    
    def get_client_ip(self, request):
        """Obtiene la IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# ====================
# PRINTJOB VIEWSET - VERSIÓN DEFINITIVA CORREGIDA
# ====================

class PrintJobViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar trabajos de impresión - VERSIÓN DEFINITIVA"""
    queryset = PrintJob.objects.all().select_related('user', 'printer', 'approved_by')
    serializer_class = PrintJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['file_name', 'user__username', 'job_id']
    ordering_fields = ['created_at', 'priority', 'estimated_hours', 'status']
    parser_classes = [MultiPartParser, FormParser]
    def get_queryset(self):
        """Filtra trabajos según permisos"""
        queryset = super().get_queryset()
        
        # Si no es admin/tecnico, solo ve sus propios trabajos
        if not (self.request.user.is_staff or 
                (hasattr(self.request.user, 'profile') and 
                 self.request.user.profile.role in ['TEC', 'ADM'])):
            queryset = queryset.filter(user=self.request.user)
        
        # Filtro por estado
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtro por usuario
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtro por impresora
        printer_id = self.request.query_params.get('printer', None)
        if printer_id:
            queryset = queryset.filter(printer_id=printer_id)
        
        # Filtro por material
        material_type = self.request.query_params.get('material', None)
        if material_type:
            queryset = queryset.filter(material_type=material_type)
        
        # Filtro por fecha
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def my_jobs(self, request):
        """Obtiene los trabajos del usuario actual"""
        queryset = self.get_queryset().filter(user=request.user)
        
        # Paginación
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Obtiene trabajos pendientes del usuario actual"""
        queryset = self.get_queryset().filter(
            user=request.user,
            status__in=[JobStatus.PENDING, JobStatus.APPROVED]
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def get_permissions(self):
        if self.action in ['approve', 'start_printing', 'complete', 'fail']:
            return [permissions.IsAuthenticated(), IsAdminOrTechnician()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Guarda el trabajo con el usuario actual - ya manejado por el serializer"""
        # El serializer ya maneja la asignación del usuario
        job = serializer.save()
        
        # Crear log
        SystemLog.objects.create(
            user=self.request.user,
            action=LogAction.CREATE,
            model_name='PrintJob',
            object_id=job.id,
            description=f"Trabajo creado: {job.file_name} por {self.request.user.username}",
            ip_address=self.get_client_ip(self.request)
        )
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Aprueba un trabajo de impresión"""
        job = self.get_object()
        
        if job.status != JobStatus.PENDING:
            return Response(
                {"detail": "Solo se pueden aprobar trabajos pendientes"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        job.status = JobStatus.APPROVED
        job.approved_by = request.user
        job.approved_at = timezone.now()
        job.save()
        
        # Crear log
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.UPDATE,
            model_name='PrintJob',
            object_id=job.id,
            description=f"Trabajo aprobado por {request.user.username}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({"detail": "Trabajo aprobado correctamente"})
    
    @action(detail=True, methods=['post'])
    def start_printing(self, request, pk=None):
        """Inicia la impresión de un trabajo"""
        job = self.get_object()
        
        if not job.can_start:
            return Response(
                {"detail": "No se puede iniciar este trabajo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            job.start_printing()
            
            # Crear log
            SystemLog.objects.create(
                user=request.user,
                action=LogAction.PRINT_START,
                model_name='PrintJob',
                object_id=job.id,
                description=f"Impresión iniciada por {request.user.username}",
                ip_address=self.get_client_ip(request)
            )
            
            return Response({"detail": "Impresión iniciada"})
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Completa un trabajo de impresión"""
        job = self.get_object()
        
        actual_hours = request.data.get('actual_hours')
        if not actual_hours:
            return Response(
                {"actual_hours": ["Este campo es requerido"]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            actual_hours = float(actual_hours)
            job.complete_job(actual_hours)
            
            # Crear log
            SystemLog.objects.create(
                user=request.user,
                action=LogAction.PRINT_END,
                model_name='PrintJob',
                object_id=job.id,
                description=f"Impresión completada por {request.user.username}",
                ip_address=self.get_client_ip(request)
            )
            
            return Response({"detail": "Trabajo completado correctamente"})
            
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def fail(self, request, pk=None):
        """Marca un trabajo como fallido"""
        job = self.get_object()
        
        error_message = request.data.get('error_message', 'Error desconocido')
        job.fail_job(error_message)
        
        # Crear log
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.ERROR,
            model_name='PrintJob',
            object_id=job.id,
            description=f"Trabajo fallido: {error_message}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({"detail": "Trabajo marcado como fallido"})
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancela un trabajo pendiente"""
        job = self.get_object()
        
        if not job.can_cancel:
            return Response(
                {"detail": "No se puede cancelar este trabajo."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        job.status = JobStatus.CANCELLED
        job.cancelled_at = timezone.now()
        job.save()
        
        # Crear log
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.UPDATE,
            model_name='PrintJob',
            object_id=job.id,
            description=f"Trabajo cancelado por {request.user.username}"
        )
        
        return Response({"detail": "Trabajo cancelado correctamente."})
    
    def get_client_ip(self, request):
        """Obtiene la IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SystemLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para ver logs del sistema (solo lectura)"""
    queryset = SystemLog.objects.all().select_related('user').order_by('-created_at')
    serializer_class = SystemLogSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['description', 'user__username', 'model_name', 'object_id']
    ordering_fields = ['created_at', 'action']
    
    def get_queryset(self):
        """Filtra logs según parámetros"""
        queryset = super().get_queryset()
        
        # Filtro por acción
        action = self.request.query_params.get('action', None)
        if action:
            queryset = queryset.filter(action=action)
        
        # Filtro por modelo
        model_name = self.request.query_params.get('model', None)
        if model_name:
            queryset = queryset.filter(model_name=model_name)
        
        # Filtro por usuario
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtro por fecha
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        return queryset


# ====================
# CUSTOM API VIEWS
# ====================

class DashboardStatsView(APIView):
    """Vista para obtener estadísticas del dashboard"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        today = timezone.now().date()
        
        stats = {
            # Totales
            'total_printers': Printer.objects.filter(is_active=True).count(),
            'total_users': User.objects.filter(is_active=True).count(),
            'total_print_jobs': PrintJob.objects.count(),
            'total_departments': Department.objects.filter(active=True).count(),
            
            # Impresoras por estado
            'printers_by_status': list(Printer.objects.filter(is_active=True)
                .values('status').annotate(count=Count('id'))),
            
            # Trabajos por estado
            'print_jobs_by_status': list(PrintJob.objects
                .values('status').annotate(count=Count('id'))),
            
            # Trabajos hoy
            'print_jobs_today': PrintJob.objects.filter(
                created_at__date=today
            ).count(),
            
            # Usuarios por rol
            'users_by_role': list(UserProfile.objects
                .values('role').annotate(count=Count('id'))),
            
            # Impresoras que necesitan mantenimiento
            'printers_needing_maintenance': Printer.objects.filter(
                is_active=True,
                total_print_hours__gte=models.F('maintenance_interval_hours')
            ).count(),
            
            # Material más usado
            'material_usage': list(PrintJob.objects
                .values('material_type').annotate(count=Count('id'))
                .order_by('-count')),
            
            # Trabajos por departamento
            'jobs_by_department': list(PrintJob.objects.filter(
                user__profile__department__isnull=False
            ).values('user__profile__department__name').annotate(
                count=Count('id')
            ).order_by('-count')),
            
            # Total de horas de impresión
            'total_print_hours': Printer.objects.aggregate(
                total=Sum('total_print_hours')
            )['total'] or 0,
            
            # Costo total generado
            'total_revenue': PrintJob.objects.filter(
                actual_cost__isnull=False
            ).aggregate(
                total=Sum('actual_cost')
            )['total'] or 0,
        }
        
        return Response(stats)


class UserRegistrationView(APIView):
    """Vista para registro de nuevos usuarios"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Crear perfil de usuario por defecto
            UserProfile.objects.create(
                user=user,
                role=UserRole.STUDENT,
                is_verified=False  # Necesita verificación por admin
            )
            
            # Crear perfil de precios por defecto
            UserPricingProfile.objects.create(user=user)
            
            # Crear log
            SystemLog.objects.create(
                user=user,
                action=LogAction.CREATE,
                model_name='User',
                object_id=user.id,
                description=f"Usuario registrado: {user.username}",
                ip_address=self.get_client_ip(request)
            )
            
            return Response(
                {"detail": "Usuario registrado correctamente. Espere verificación."},
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        """Obtiene la IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip