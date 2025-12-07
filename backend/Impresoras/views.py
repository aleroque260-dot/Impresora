import os
import uuid
import logging
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Sum, Avg, Q, F
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import (
    Department, UserProfile, Printer, UserPrinterAssignment,
    PricingConfig, UserPricingProfile, PrintJob, SystemLog,
    JobStatus, PrinterStatus, UserRole, MaterialType, PrinterType,LogAction)

from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer, CurrentUserSerializer,
    DepartmentSerializer, UserProfileSerializer, SimpleUserProfileSerializer,
    PrintJobUploadSerializer, PrintJobListSerializer, PrintJobDetailSerializer,
    PrintJobReviewSerializer, PrintJobApproveSerializer, PrintJobAssignmentSerializer,
    PrintJobStatusUpdateSerializer, UserNotificationSerializer,PrinterSerializer,UserPrinterAssignmentSerializer,PricingConfigSerializer,UserPricingProfileSerializer,SystemLogSerializer
)
logger = logging.getLogger(__name__)


# ====================
# PERMISSION CLASSES (MANTENER)
# ====================

class IsOwnerOrAdmin(permissions.BasePermission):
    """Permite acceso al dueño o administrador"""
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Administradores siempre tienen acceso
        if user.is_staff:
            return True
        
        # Usuario no autenticado no tiene acceso
        if not user.is_authenticated:
            return False
        
        # Verificar ownership directo
        if hasattr(obj, 'user') and obj.user and obj.user == user:
            return True
        
        # Verificar creador (si existe y no es None)
        if hasattr(obj, 'created_by') and obj.created_by and obj.created_by == user:
            return True
        
        # Caso especial: UserProfile
        if isinstance(obj, UserProfile) and obj.user == user:
            return True
        
        return False

class IsAdminOrTechnician(permissions.BasePermission):
    """Permite acceso a administradores o técnicos"""
    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
        
        try:
            profile = request.user.profile
            # Usar los valores de los choices
            return profile.role in [UserRole.TECHNICIAN, UserRole.ADMIN]
        except UserProfile.DoesNotExist:
            return False

class IsAdminOrReadOnly(permissions.BasePermission):
    """Permite escritura solo a administradores"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

# ====================
# NUEVAS VISTAS PARA EL FLUJO DE IMPRESIÓN
# ====================

class PrintJobUploadView(APIView):
    """
    Vista para que los usuarios suban archivos de impresión
    POST: Subir archivo STL/GCODE
    """
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Subir archivo para impresión
        Campos requeridos: file (archivo .stl/.gcode)
        Opcionales: material_type, material_weight, estimated_hours, etc.
        """
        try:
            # Verificar que el usuario puede imprimir
            if hasattr(request.user, 'profile') and not request.user.profile.can_print:
                return Response(
                    {"detail": "Tu cuenta no está verificada para imprimir"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar límite de trabajos concurrentes
            active_jobs = PrintJob.objects.filter(
                user=request.user,
                status__in=[JobStatus.PENDING, JobStatus.APPROVED, JobStatus.PRINTING]
            ).count()
            
            max_jobs = getattr(request.user.profile, 'max_concurrent_jobs', 3)
            if active_jobs >= max_jobs:
                return Response(
                    {"detail": f"Tienes demasiados trabajos activos. Máximo: {max_jobs}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Serializar y validar
            serializer = PrintJobUploadSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                print_job = serializer.save()
                
                # Crear log
                SystemLog.objects.create(
                    user=request.user,
                    action=LogAction.CREATE,
                    model_name='PrintJob',
                    object_id=print_job.id,
                    description=f"Archivo subido: {print_job.file_name}",
                    ip_address=self.get_client_ip(request)
                )
                
                # Notificar al administrador
                self.notify_admins(print_job)
                
                return Response({
                    "detail": "Archivo subido exitosamente",
                    "job_id": str(print_job.job_id),
                    "file_name": print_job.file_name,
                    "status": print_job.get_status_display(),
                    "estimated_hours": print_job.estimated_hours,
                    "material": print_job.get_material_type_display(),
                    "submitted_at": print_job.created_at
                }, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error subiendo archivo: {str(e)}")
            return Response(
                {"detail": "Error interno del servidor"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def notify_admins(self, print_job):
        """Notificar a administradores sobre nuevo trabajo"""
        admins = User.objects.filter(
            profile__role=UserRole.ADMIN,
            is_active=True
        )
        
        for admin in admins:
            # Aquí podrías implementar notificaciones por email
            SystemLog.objects.create(
                user=admin,
                action=LogAction.CREATE,
                model_name='Notification',
                object_id=print_job.id,
                description=f"Nuevo trabajo pendiente de {print_job.user.username}: {print_job.file_name}"
            )
    
    def get_client_ip(self, request):
        """Obtiene la IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# printers/views.py - AGREGAR ESTO

class UserPrinterAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar asignaciones de impresoras a usuarios"""
    queryset = UserPrinterAssignment.objects.all().select_related('user', 'printer', 'created_by')
    serializer_class = UserPrinterAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTechnician]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'printer__name', 'reason']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Si no es admin/tecnico, solo ver sus propias asignaciones
        if not (self.request.user.is_staff or 
                (hasattr(self.request.user, 'profile') and 
                 self.request.user.profile.role in [UserRole.TECHNICIAN, UserRole.ADMIN])):
            queryset = queryset.filter(user=self.request.user)
        
        # Filtros adicionales
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        printer_id = self.request.query_params.get('printer_id', None)
        if printer_id:
            queryset = queryset.filter(printer_id=printer_id)
        
        active_only = self.request.query_params.get('active', None)
        if active_only is not None:
            active = active_only.lower() == 'true'
            queryset = queryset.filter(active=active)
        
        return queryset
    
    def perform_create(self, serializer):
        """Crear asignación automáticamente"""
        assignment = serializer.save(
            created_by=self.request.user
        )
        
        # Crear log
        SystemLog.objects.create(
            user=self.request.user,
            action=LogAction.CREATE,
            model_name='UserPrinterAssignment',
            object_id=assignment.id,
            description=f"Asignación creada: {assignment.user.username} - {assignment.printer.name}",
            ip_address=self.get_client_ip(self.request)
        )
        
        # Actualizar estado de la impresora a RESERVED
        assignment.printer.status = PrinterStatus.RESERVED
        assignment.printer.save()
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Desactivar una asignación"""
        assignment = self.get_object()
        
        if not assignment.active:
            return Response(
                {"detail": "Esta asignación ya está inactiva"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignment.deactivate()
        
        # Liberar impresora si no tiene otras asignaciones activas
        active_assignments = UserPrinterAssignment.objects.filter(
            printer=assignment.printer,
            active=True
        ).count()
        
        if active_assignments == 0:
            assignment.printer.status = PrinterStatus.AVAILABLE
            assignment.printer.save()
        
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.UPDATE,
            model_name='UserPrinterAssignment',
            object_id=assignment.id,
            description=f"Asignación desactivada: {assignment.user.username} - {assignment.printer.name}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({
            "detail": "Asignación desactivada correctamente",
            "assignment": UserPrinterAssignmentSerializer(assignment).data
        })
    
    @action(detail=False, methods=['get'])
    def active_assignments(self, request):
        """Obtener asignaciones activas"""
        active_assignments = self.get_queryset().filter(
            active=True,
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now()
        ) | self.get_queryset().filter(
            active=True,
            start_date__lte=timezone.now(),
            end_date__isnull=True
        )
        
        serializer = self.get_serializer(active_assignments, many=True)
        
        return Response({
            "active_assignments": serializer.data,
            "count": active_assignments.count()
        })
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

# printers/views.py - AGREGAR DESPUÉS DE UserPrinterAssignmentViewSet

class PricingConfigViewSet(viewsets.ModelViewSet):
    """ViewSet para configuración de precios"""
    queryset = PricingConfig.objects.all()
    serializer_class = PricingConfigSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTechnician]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['valid_from', 'created_at', 'active']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Para usuarios no-admin, solo mostrar configuraciones activas y válidas
        if not (self.request.user.is_staff or 
                (hasattr(self.request.user, 'profile') and 
                 self.request.user.profile.role in [UserRole.TECHNICIAN, UserRole.ADMIN])):
            queryset = queryset.filter(active=True)
        
        # Filtrar por estado de validez
        valid_only = self.request.query_params.get('valid_only', 'true')
        if valid_only.lower() == 'true':
            now = timezone.now()
            queryset = queryset.filter(
                Q(valid_to__isnull=True) | Q(valid_to__gte=now),
                valid_from__lte=now
            )
        
        # Filtrar por activo/inactivo
        active_filter = self.request.query_params.get('active', None)
        if active_filter is not None:
            active = active_filter.lower() == 'true'
            queryset = queryset.filter(active=active)
        
        return queryset
    
    def perform_create(self, serializer):
        """Crear nueva configuración de precios"""
        pricing_config = serializer.save()
        
        # Si se marca como activa, desactivar las demás
        if pricing_config.active:
            PricingConfig.objects.exclude(id=pricing_config.id).update(active=False)
        
        # Crear log
        SystemLog.objects.create(
            user=self.request.user,
            action=LogAction.CREATE,
            model_name='PricingConfig',
            object_id=pricing_config.id,
            description=f"Configuración de precios creada: {pricing_config.name}",
            ip_address=self.get_client_ip(self.request)
        )
    
    def perform_update(self, serializer):
        """Actualizar configuración de precios"""
        instance = self.get_object()
        before_data = {
            'name': instance.name,
            'active': instance.active,
            'cost_per_hour': float(instance.cost_per_hour),
            'cost_per_gram': float(instance.cost_per_gram)
        }
        
        pricing_config = serializer.save()
        
        # Si se marca como activa, desactivar las demás
        if pricing_config.active:
            PricingConfig.objects.exclude(id=pricing_config.id).update(active=False)
        
        after_data = {
            'name': pricing_config.name,
            'active': pricing_config.active,
            'cost_per_hour': float(pricing_config.cost_per_hour),
            'cost_per_gram': float(pricing_config.cost_per_gram)
        }
        
        # Crear log detallado
        SystemLog.objects.create(
            user=self.request.user,
            action=LogAction.UPDATE,
            model_name='PricingConfig',
            object_id=pricing_config.id,
            description=f"Configuración de precios actualizada: {pricing_config.name}",
            before_data=before_data,
            after_data=after_data,
            ip_address=self.get_client_ip(self.request)
        )
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activar esta configuración de precios"""
        pricing_config = self.get_object()
        
        if not pricing_config.is_currently_valid:
            return Response(
                {"detail": "Esta configuración no es válida actualmente"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pricing_config.active = True
        pricing_config.save()
        
        # Desactivar todas las demás
        PricingConfig.objects.exclude(id=pricing_config.id).update(active=False)
        
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.UPDATE,
            model_name='PricingConfig',
            object_id=pricing_config.id,
            description=f"Configuración de precios activada: {pricing_config.name}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({
            "detail": "Configuración de precios activada",
            "config": PricingConfigSerializer(pricing_config).data
        })
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Obtener la configuración de precios activa actual"""
        try:
            current_config = PricingConfig.objects.get(active=True, is_currently_valid=True)
            serializer = self.get_serializer(current_config)
            return Response(serializer.data)
        except PricingConfig.DoesNotExist:
            return Response(
                {"detail": "No hay configuración de precios activa"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserPricingProfileViewSet(viewsets.ModelViewSet):
    """ViewSet para perfiles de precios de usuarios"""
    queryset = UserPricingProfile.objects.all().select_related('user', 'pricing_config')
    serializer_class = UserPricingProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['balance', 'total_spent', 'credit_limit', 'created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Usuarios normales solo ven su propio perfil
        if not (self.request.user.is_staff or 
                (hasattr(self.request.user, 'profile') and 
                 self.request.user.profile.role in [UserRole.TECHNICIAN, UserRole.ADMIN])):
            queryset = queryset.filter(user=self.request.user)
        
        # Filtrar por usuario específico (para admins)
        user_id = self.request.query_params.get('user_id', None)
        if user_id and (self.request.user.is_staff or 
                       (hasattr(self.request.user, 'profile') and 
                        self.request.user.profile.role in [UserRole.TECHNICIAN, UserRole.ADMIN])):
            queryset = queryset.filter(user_id=user_id)
        
        # Filtrar por balance negativo/deudores
        debtors_only = self.request.query_params.get('debtors_only', None)
        if debtors_only is not None and debtors_only.lower() == 'true':
            queryset = queryset.filter(balance__lt=0)
        
        return queryset
    
    def perform_create(self, serializer):
        """Crear perfil de precios"""
        pricing_profile = serializer.save()
        
        SystemLog.objects.create(
            user=self.request.user,
            action=LogAction.CREATE,
            model_name='UserPricingProfile',
            object_id=pricing_profile.id,
            description=f"Perfil de precios creado para {pricing_profile.user.username}",
            ip_address=self.get_client_ip(self.request)
        )
    
    def perform_update(self, serializer):
        """Actualizar perfil de precios"""
        instance = self.get_object()
        before_data = {
            'balance': float(instance.balance),
            'credit_limit': float(instance.credit_limit),
            'discount_percentage': float(instance.discount_percentage)
        }
        
        pricing_profile = serializer.save()
        
        after_data = {
            'balance': float(pricing_profile.balance),
            'credit_limit': float(pricing_profile.credit_limit),
            'discount_percentage': float(pricing_profile.discount_percentage)
        }
        
        SystemLog.objects.create(
            user=self.request.user,
            action=LogAction.UPDATE,
            model_name='UserPricingProfile',
            object_id=pricing_profile.id,
            description=f"Perfil de precios actualizado para {pricing_profile.user.username}",
            before_data=before_data,
            after_data=after_data,
            ip_address=self.get_client_ip(self.request)
        )
    
    @action(detail=True, methods=['post'])
    def add_balance(self, request, pk=None):
        """Agregar saldo al perfil"""
        pricing_profile = self.get_object()
        
        amount = request.data.get('amount')
        if not amount:
            return Response(
                {"amount": "Este campo es requerido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError
        except ValueError:
            return Response(
                {"amount": "Debe ser un número positivo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar permisos (solo admin o el propio usuario)
        if (not request.user.is_staff and 
            request.user.profile.role not in [UserRole.TECHNICIAN, UserRole.ADMIN] and
            pricing_profile.user != request.user):
            return Response(
                {"detail": "No tienes permiso para modificar este saldo"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        old_balance = float(pricing_profile.balance)
        pricing_profile.add_balance(amount)
        
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.PAYMENT,
            model_name='UserPricingProfile',
            object_id=pricing_profile.id,
            description=f"Saldo agregado: {amount} CUP. Balance anterior: {old_balance}, Nuevo: {pricing_profile.balance}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({
            "detail": f"Se agregaron {amount} CUP al saldo",
            "old_balance": old_balance,
            "new_balance": float(pricing_profile.balance),
            "available_credit": float(pricing_profile.available_credit)
        })
    
    @action(detail=True, methods=['post'])
    def set_credit_limit(self, request, pk=None):
        """Establecer límite de crédito"""
        pricing_profile = self.get_object()
        
        # Solo administradores pueden cambiar límites de crédito
        if not (request.user.is_staff or 
                (hasattr(request.user, 'profile') and 
                 request.user.profile.role in [UserRole.TECHNICIAN, UserRole.ADMIN])):
            return Response(
                {"detail": "Solo administradores pueden cambiar límites de crédito"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_limit = request.data.get('credit_limit')
        if not new_limit:
            return Response(
                {"credit_limit": "Este campo es requerido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_limit = float(new_limit)
            if new_limit < 0:
                raise ValueError
        except ValueError:
            return Response(
                {"credit_limit": "Debe ser un número positivo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_limit = float(pricing_profile.credit_limit)
        pricing_profile.credit_limit = new_limit
        pricing_profile.save()
        
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.UPDATE,
            model_name='UserPricingProfile',
            object_id=pricing_profile.id,
            description=f"Límite de crédito cambiado: {old_limit} -> {new_limit} CUP",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({
            "detail": f"Límite de crédito actualizado",
            "old_limit": old_limit,
            "new_limit": new_limit,
            "available_credit": float(pricing_profile.available_credit)
        })
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Obtener el perfil del usuario actual"""
        try:
            profile = UserPricingProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserPricingProfile.DoesNotExist:
            return Response(
                {"detail": "Perfil de precios no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SystemLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para logs del sistema (solo lectura)"""
    queryset = SystemLog.objects.all().select_related('user')
    serializer_class = SystemLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTechnician]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'model_name', 'description', 'action', 'object_id']
    ordering_fields = ['created_at', 'action', 'model_name']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por rango de fechas
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        # Filtrar por usuario
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtrar por acción
        action = self.request.query_params.get('action', None)
        if action:
            queryset = queryset.filter(action=action)
        
        # Filtrar por modelo
        model_name = self.request.query_params.get('model_name', None)
        if model_name:
            queryset = queryset.filter(model_name=model_name)
        
        # Filtrar por objeto específico
        object_id = self.request.query_params.get('object_id', None)
        if object_id:
            queryset = queryset.filter(object_id=object_id)
        
        # Solo logs recientes (últimos 30 días por defecto)
        recent_only = self.request.query_params.get('recent_only', 'true')
        if recent_only.lower() == 'true':
            thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
            queryset = queryset.filter(created_at__gte=thirty_days_ago)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Resumen estadístico de logs"""
        # Logs por acción
        logs_by_action = list(
            SystemLog.objects.values('action')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        # Logs por usuario
        logs_by_user = list(
            SystemLog.objects.filter(user__isnull=False)
            .values('user__username')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        
        # Logs por modelo
        logs_by_model = list(
            SystemLog.objects.values('model_name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        # Logs recientes (últimas 24 horas)
        last_24_hours = timezone.now() - timezone.timedelta(hours=24)
        recent_logs_count = SystemLog.objects.filter(
            created_at__gte=last_24_hours
        ).count()
        
        # Errores recientes
        error_logs_count = SystemLog.objects.filter(
            action=LogAction.ERROR,
            created_at__gte=last_24_hours
        ).count()
        
        return Response({
            'logs_by_action': logs_by_action,
            'logs_by_user': logs_by_user,
            'logs_by_model': logs_by_model,
            'recent_stats': {
                'last_24_hours': recent_logs_count,
                'errors_last_24_hours': error_logs_count,
                'unique_users_last_24_hours': SystemLog.objects.filter(
                    created_at__gte=last_24_hours,
                    user__isnull=False
                ).values('user').distinct().count()
            },
            'total_logs': SystemLog.objects.count(),
            'oldest_log': SystemLog.objects.order_by('created_at').first().created_at if SystemLog.objects.exists() else None,
            'newest_log': SystemLog.objects.order_by('-created_at').first().created_at if SystemLog.objects.exists() else None
        })
    
    @action(detail=False, methods=['get'])
    def user_activity(self, request):
        """Actividad del usuario actual"""
        user_logs = SystemLog.objects.filter(user=request.user).order_by('-created_at')[:50]
        serializer = self.get_serializer(user_logs, many=True)
        
        # Resumen de actividad
        activity_summary = {
            'total_actions': user_logs.count(),
            'last_action': user_logs.first().created_at if user_logs.exists() else None,
            'actions_by_type': list(
                user_logs.values('action')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
        }
        
        return Response({
            'activity_logs': serializer.data,
            'summary': activity_summary
        })
class PrinterViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar impresoras"""
    queryset = Printer.objects.all()
    serializer_class = PrinterSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTechnician]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'serial_number', 'brand', 'model', 'location']
    ordering_fields = ['name', 'status', 'total_print_hours', 'created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros adicionales
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        printer_type = self.request.query_params.get('type', None)
        if printer_type:
            queryset = queryset.filter(printer_type=printer_type)
        
        department_id = self.request.query_params.get('department', None)
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        needs_maintenance = self.request.query_params.get('needs_maintenance', None)
        if needs_maintenance is not None:
            # CORRECTO: Ahora 'models' está importado
            queryset = queryset.filter(
                total_print_hours__gte=models.F('maintenance_interval_hours')
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def set_status(self, request, pk=None):
        """Cambiar estado de impresora"""
        printer = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(PrinterStatus.choices):
            return Response(
                {"status": "Estado no válido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        printer.status = new_status
        printer.save()
        
        SystemLog.objects.create(
            user=request.user,
            action=LogAction.UPDATE,
            model_name='Printer',
            object_id=printer.id,
            description=f"Estado cambiado a {new_status}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({
            "detail": f"Estado actualizado a {new_status}",
            "printer": PrinterSerializer(printer).data
        })
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class PrintJobReviewView(APIView):
    """
    Vista para que administradores revisen trabajos pendientes
    GET: Listar trabajos para revisión
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTechnician]
    
    def get(self, request):
        """
        Obtener trabajos pendientes de revisión
        Filtros: status=pending, user_id, department_id, material_type
        """
        try:
            # Trabajos pendientes de revisión
            queryset = PrintJob.objects.filter(
                status=JobStatus.PENDING
            ).select_related('user', 'user__profile__department').order_by('-created_at')
            
            # Aplicar filtros
            user_id = request.query_params.get('user_id')
            if user_id:
                queryset = queryset.filter(user_id=user_id)
            
            department_id = request.query_params.get('department_id')
            if department_id:
                queryset = queryset.filter(user__profile__department_id=department_id)
            
            material_type = request.query_params.get('material_type')
            if material_type:
                queryset = queryset.filter(material_type=material_type)
            
            # Paginación
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = PrintJobReviewSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = PrintJobReviewSerializer(queryset, many=True)
            
            # Estadísticas
            stats = {
                'total_pending': queryset.count(),
                'pending_by_department': list(
                    queryset.values('user__profile__department__name')
                    .annotate(count=Count('id'))
                    .order_by('-count')
                ),
                'pending_by_material': list(
                    queryset.values('material_type')
                    .annotate(count=Count('id'))
                    .order_by('-count')
                ),
                'average_estimated_hours': queryset.aggregate(
                    avg=Avg('estimated_hours')
                )['avg'] or 0
            }
            
            return Response({
                'jobs': serializer.data,
                'stats': stats,
                'total': queryset.count()
            })
            
        except Exception as e:
            logger.error(f"Error obteniendo trabajos para revisión: {str(e)}")
            return Response(
                {"detail": "Error interno del servidor"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def paginate_queryset(self, queryset, request):
        """Paginación simple"""
        page_size = int(request.query_params.get('page_size', 20))
        page = int(request.query_params.get('page', 1))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        if start >= len(queryset):
            return None
        
        return list(queryset)[start:end]
    
    def get_paginated_response(self, data):
        """Respuesta paginada"""
        return Response({
            'results': data,
            'count': len(data),
            'next': None,  # Implementar lógica de next/previous si es necesario
            'previous': None
        })


class PrintJobApproveView(APIView):
    """
    Vista para que administradores aprueben/rechacen trabajos
    POST: Aprobar o rechazar trabajo
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTechnician]
    
    def post(self, request, job_id):
        """
        Aprobar o rechazar un trabajo
        Campos: action (approve/reject), rejection_reason (opcional para reject)
        """
        try:
            # Obtener trabajo
            print_job = get_object_or_404(PrintJob, job_id=job_id)
            
            # Verificar que esté pendiente
            if print_job.status != JobStatus.PENDING:
                return Response(
                    {"detail": "Este trabajo ya ha sido procesado"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Serializar y validar
            serializer = PrintJobApproveSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            action = serializer.validated_data.get('action')
            rejection_reason = serializer.validated_data.get('rejection_reason', '')
            
            if action == 'approve':
                # Aprobar trabajo
                print_job.status = JobStatus.APPROVED
                print_job.approved_by = request.user
                print_job.approved_at = timezone.now()
                print_job.save()
                
                # Crear log
                SystemLog.objects.create(
                    user=request.user,
                    action=LogAction.UPDATE,
                    model_name='PrintJob',
                    object_id=print_job.id,
                    description=f"Trabajo aprobado por {request.user.username}",
                    ip_address=self.get_client_ip(request)
                )
                
                # Notificar al usuario
                self.notify_user(print_job, 'approved', None)
                
                return Response({
                    "detail": "Trabajo aprobado exitosamente",
                    "job_id": str(print_job.job_id),
                    "status": print_job.get_status_display(),
                    "approved_by": request.user.get_full_name(),
                    "approved_at": print_job.approved_at
                })
            
            elif action == 'reject':
                # Rechazar trabajo
                print_job.status = JobStatus.REJECTED
                print_job.error_message = rejection_reason
                print_job.save()
                
                # Crear log
                SystemLog.objects.create(
                    user=request.user,
                    action=LogAction.UPDATE,
                    model_name='PrintJob',
                    object_id=print_job.id,
                    description=f"Trabajo rechazado por {request.user.username}: {rejection_reason}",
                    ip_address=self.get_client_ip(request)
                )
                
                # Notificar al usuario
                self.notify_user(print_job, 'rejected', rejection_reason)
                
                return Response({
                    "detail": "Trabajo rechazado",
                    "job_id": str(print_job.job_id),
                    "status": print_job.get_status_display(),
                    "rejection_reason": rejection_reason,
                    "rejected_by": request.user.get_full_name(),
                    "rejected_at": timezone.now()
                })
            
            else:
                return Response(
                    {"detail": "Acción no válida"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except PrintJob.DoesNotExist:
            return Response(
                {"detail": "Trabajo no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error aprobando trabajo: {str(e)}")
            return Response(
                {"detail": "Error interno del servidor"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def notify_user(self, print_job, action, reason=None):
        """Notificar al usuario sobre el cambio de estado"""
        # Aquí podrías implementar notificaciones por email
        notification_data = {
            'job_id': str(print_job.job_id),
            'file_name': print_job.file_name,
            'action': action,
            'reason': reason,
            'timestamp': timezone.now()
        }
        
        SystemLog.objects.create(
            user=print_job.user,
            action=LogAction.UPDATE,
            model_name='Notification',
            object_id=print_job.id,
            description=f"Trabajo {action}: {print_job.file_name}",
            after_data=notification_data
        )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')


class PrinterAssignmentView(APIView):
    """
    Vista para asignar impresoras a trabajos aprobados
    POST: Asignar impresora a trabajo
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTechnician]
    
    def post(self, request, job_id):
        """
        Asignar impresora a un trabajo aprobado
        Campos: printer_id (ID de la impresora)
        """
        try:
            # Obtener trabajo
            print_job = get_object_or_404(PrintJob, job_id=job_id)
            
            # Verificar que esté aprobado
            if print_job.status != JobStatus.APPROVED:
                return Response(
                    {"detail": "Solo se pueden asignar impresoras a trabajos aprobados"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Serializar y validar
            serializer = PrintJobAssignmentSerializer(
                print_job, 
                data=request.data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                # Actualizar trabajo con impresora asignada
                updated_job = serializer.save()
                updated_job.status = JobStatus.ASSIGNED
                updated_job.assigned_at = timezone.now()
                updated_job.save()
                
                # Actualizar estado de la impresora
                printer = updated_job.printer
                printer.status = PrinterStatus.RESERVED
                printer.save()
                
                # Crear log
                SystemLog.objects.create(
                    user=request.user,
                    action=LogAction.UPDATE,
                    model_name='PrintJob',
                    object_id=print_job.id,
                    description=f"Impresora asignada: {printer.name} a trabajo {print_job.job_id}",
                    ip_address=self.get_client_ip(request)
                )
                
                # Notificar al usuario
                self.notify_user_assignment(print_job, printer)
                
                return Response({
                    "detail": "Impresora asignada exitosamente",
                    "job_id": str(print_job.job_id),
                    "printer": {
                        "id": printer.id,
                        "name": printer.name,
                        "location": printer.location,
                        "type": printer.get_printer_type_display()
                    },
                    "assigned_at": print_job.assigned_at,
                    "estimated_start_time": self.calculate_start_time(print_job, printer)
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except PrintJob.DoesNotExist:
            return Response(
                {"detail": "Trabajo no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error asignando impresora: {str(e)}")
            return Response(
                {"detail": "Error interno del servidor"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def calculate_start_time(self, print_job, printer):
        """Calcular tiempo estimado de inicio"""
        # Obtener trabajos en cola para esta impresora
        queued_jobs = PrintJob.objects.filter(
            printer=printer,
            status__in=[JobStatus.ASSIGNED, JobStatus.PRINTING]
        ).order_by('assigned_at')
        
        total_hours = sum(job.estimated_hours for job in queued_jobs if job != print_job)
        
        # Agregar 1 hora de preparación por trabajo
        estimated_start = timezone.now() + timezone.timedelta(
            hours=total_hours + queued_jobs.count()
        )
        
        return estimated_start
    
    def notify_user_assignment(self, print_job, printer):
        """Notificar al usuario sobre asignación de impresora"""
        notification_data = {
            'job_id': str(print_job.job_id),
            'file_name': print_job.file_name,
            'printer_name': printer.name,
            'printer_location': printer.location,
            'assigned_at': timezone.now(),
            'message': f"Tu trabajo ha sido asignado a la impresora {printer.name}"
        }
        
        SystemLog.objects.create(
            user=print_job.user,
            action=LogAction.UPDATE,
            model_name='Notification',
            object_id=print_job.id,
            description=f"Impresora asignada a trabajo {print_job.file_name}",
            after_data=notification_data
        )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')


class PrintJobStatusUpdateView(APIView):
    """
    Vista para actualizar estado de impresión (printing, completed, failed)
    PUT: Actualizar estado
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTechnician]
    
    def put(self, request, job_id):
        """
        Actualizar estado de impresión
        Campos: status, actual_hours (para completed), error_message (para failed)
        """
        try:
            # Obtener trabajo
            print_job = get_object_or_404(PrintJob, job_id=job_id)
            
            # Serializar y validar
            serializer = PrintJobStatusUpdateSerializer(
                print_job,
                data=request.data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                # Actualizar estado
                new_status = serializer.validated_data.get('status')
                print_job.status = new_status
                
                # Actualizar campos según estado
                if new_status == JobStatus.PRINTING:
                    print_job.started_at = timezone.now()
                    # Actualizar estado de impresora
                    if print_job.printer:
                        print_job.printer.status = PrinterStatus.PRINTING
                        print_job.printer.save()
                
                elif new_status == JobStatus.COMPLETED:
                    print_job.completed_at = timezone.now()
                    print_job.actual_hours = serializer.validated_data.get('actual_hours')
                    # Liberar impresora
                    if print_job.printer:
                        print_job.printer.status = PrinterStatus.AVAILABLE
                        print_job.printer.total_print_hours += print_job.actual_hours or 0
                        print_job.printer.save()
                    # Calcular costo real
                    print_job.calculate_estimated_cost()
                
                elif new_status == JobStatus.FAILED:
                    print_job.error_message = serializer.validated_data.get('error_message', 'Error desconocido')
                    # Liberar impresora
                    if print_job.printer:
                        print_job.printer.status = PrinterStatus.AVAILABLE
                        print_job.printer.save()
                
                print_job.save()
                
                # Crear log
                SystemLog.objects.create(
                    user=request.user,
                    action=LogAction.UPDATE,
                    model_name='PrintJob',
                    object_id=print_job.id,
                    description=f"Estado cambiado a {new_status} por {request.user.username}",
                    ip_address=self.get_client_ip(request)
                )
                
                # Notificar al usuario
                self.notify_user_status_change(print_job, new_status)
                
                return Response({
                    "detail": f"Estado actualizado a {new_status}",
                    "job_id": str(print_job.job_id),
                    "status": print_job.get_status_display(),
                    "updated_at": print_job.updated_at
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except PrintJob.DoesNotExist:
            return Response(
                {"detail": "Trabajo no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error actualizando estado: {str(e)}")
            return Response(
                {"detail": "Error interno del servidor"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def notify_user_status_change(self, print_job, new_status):
        """Notificar al usuario sobre cambio de estado"""
        status_messages = {
            JobStatus.PRINTING: f"Tu trabajo {print_job.file_name} ha comenzado a imprimirse",
            JobStatus.COMPLETED: f"¡Tu trabajo {print_job.file_name} se ha completado!",
            JobStatus.FAILED: f"Tu trabajo {print_job.file_name} ha fallado durante la impresión",
            JobStatus.PAUSED: f"Tu trabajo {print_job.file_name} ha sido pausado",
        }
        
        message = status_messages.get(new_status, f"Estado de tu trabajo actualizado a {new_status}")
        
        notification_data = {
            'job_id': str(print_job.job_id),
            'file_name': print_job.file_name,
            'status': new_status,
            'message': message,
            'timestamp': timezone.now()
        }
        
        SystemLog.objects.create(
            user=print_job.user,
            action=LogAction.UPDATE,
            model_name='Notification',
            object_id=print_job.id,
            description=f"Estado actualizado: {new_status}",
            after_data=notification_data
        )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')


class UserNotificationsView(APIView):
    """
    Vista para que usuarios vean sus notificaciones
    GET: Obtener notificaciones del usuario
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Obtener notificaciones del usuario actual
        Filtros: unread_only=true, limit, job_id
        """
        try:
            # Obtener trabajos del usuario con cambios recientes
            user_jobs = PrintJob.objects.filter(user=request.user).order_by('-updated_at')
            
            # Aplicar filtros
            unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
            limit = int(request.query_params.get('limit', 50))
            job_id = request.query_params.get('job_id')
            
            if job_id:
                user_jobs = user_jobs.filter(job_id=job_id)
            
            # Limitar resultados
            user_jobs = user_jobs[:limit]
            
            # Serializar notificaciones
            notifications = []
            for job in user_jobs:
                # Crear notificación basada en el estado
                notification = {
                    'id': job.id,
                    'job_id': str(job.job_id),
                    'file_name': job.file_name,
                    'status': job.status,
                    'status_display': job.get_status_display(),
                    'updated_at': job.updated_at,
                    'message': self.get_status_message(job),
                    'is_unread': job.updated_at > getattr(request.user, 'last_notification_check', timezone.now() - timezone.timedelta(days=7))
                }
                
                # Solo incluir no leídas si se solicita
                if not unread_only or notification['is_unread']:
                    notifications.append(notification)
            
            # Ordenar por fecha (más reciente primero)
            notifications.sort(key=lambda x: x['updated_at'], reverse=True)
            
            # Estadísticas
            stats = {
                'total_notifications': len(notifications),
                'unread_count': sum(1 for n in notifications if n['is_unread']),
                'by_status': {},
                'recent_jobs': user_jobs.count()
            }
            
            # Contar por estado
            for notification in notifications:
                status = notification['status']
                stats['by_status'][status] = stats['by_status'].get(status, 0) + 1
            
            return Response({
                'notifications': notifications,
                'stats': stats,
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'last_check': getattr(request.user, 'last_notification_check', None)
                }
            })
            
        except Exception as e:
            logger.error(f"Error obteniendo notificaciones: {str(e)}")
            return Response(
                {"detail": "Error interno del servidor"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_status_message(self, print_job):
        """Obtener mensaje amigable basado en el estado"""
        messages = {
            JobStatus.PENDING: "Tu trabajo está pendiente de revisión",
            JobStatus.APPROVED: "¡Tu trabajo ha sido aprobado!",
            JobStatus.REJECTED: f"Tu trabajo ha sido rechazado: {print_job.error_message}",
            JobStatus.ASSIGNED: f"Tu trabajo ha sido asignado a una impresora",
            JobStatus.PRINTING: "Tu trabajo está siendo impreso",
            JobStatus.COMPLETED: "¡Tu trabajo se ha completado!",
            JobStatus.FAILED: f"Tu trabajo ha fallado: {print_job.error_message}",
            JobStatus.CANCELLED: "Tu trabajo ha sido cancelado",
            JobStatus.PAUSED: "Tu trabajo ha sido pausado",
        }
        
        return messages.get(print_job.status, "Estado actualizado")


class PrintJobDetailView(APIView):
    """
    Vista para ver detalles de un trabajo específico
    GET: Obtener detalles del trabajo
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, job_id):
        """
        Obtener detalles completos de un trabajo
        """
        try:
            # Obtener trabajo
            print_job = get_object_or_404(PrintJob, job_id=job_id)
            
            # Verificar permisos
            if not (request.user.is_staff or 
                   request.user.profile.role in [UserRole.TECHNICIAN, UserRole.ADMIN] or
                   print_job.user == request.user):
                return Response(
                    {"detail": "No tienes permiso para ver este trabajo"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Serializar detalles
            serializer = PrintJobDetailSerializer(print_job)
            
            # Información adicional
            additional_info = {
                'can_take_action': self.can_take_action(print_job, request.user),
                'available_actions': self.get_available_actions(print_job, request.user),
                'printer_info': self.get_printer_info(print_job),
                'cost_breakdown': self.get_cost_breakdown(print_job),
                'timeline': self.get_timeline(print_job)
            }
            
            return Response({
                'job': serializer.data,
                'additional_info': additional_info
            })
            
        except PrintJob.DoesNotExist:
            return Response(
                {"detail": "Trabajo no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error obteniendo detalles: {str(e)}")
            return Response(
                {"detail": "Error interno del servidor"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def can_take_action(self, print_job, user):
        """Verificar si el usuario puede realizar acciones en este trabajo"""
        if user.is_staff or user.profile.role in [UserRole.TECHNICIAN, UserRole.ADMIN]:
            return True
        return print_job.user == user and print_job.status in [JobStatus.PENDING, JobStatus.APPROVED]
    
    def get_available_actions(self, print_job, user):
        """Obtener acciones disponibles para este usuario"""
        actions = []
        
        if user.is_staff or user.profile.role in [UserRole.TECHNICIAN, UserRole.ADMIN]:
            # Acciones de admin
            if print_job.status == JobStatus.PENDING:
                actions.extend(['approve', 'reject'])
            elif print_job.status == JobStatus.APPROVED:
                actions.append('assign_printer')
            elif print_job.status == JobStatus.ASSIGNED:
                actions.append('start_printing')
            elif print_job.status == JobStatus.PRINTING:
                actions.extend(['complete', 'fail', 'pause'])
            elif print_job.status == JobStatus.PAUSED:
                actions.extend(['resume', 'cancel'])
        
        # Acciones de usuario
        if print_job.user == user:
            if print_job.status in [JobStatus.PENDING, JobStatus.APPROVED]:
                actions.append('cancel')
        
        return actions
    
    def get_printer_info(self, print_job):
        """Obtener información de la impresora asignada"""
        if not print_job.printer:
            return None
        
        return {
            'id': print_job.printer.id,
            'name': print_job.printer.name,
            'serial_number': print_job.printer.serial_number,
            'type': print_job.printer.get_printer_type_display(),
            'status': print_job.printer.get_status_display(),
            'location': print_job.printer.location,
            'build_volume': print_job.printer.build_volume,
            'total_print_hours': print_job.printer.total_print_hours
        }
    
    def get_cost_breakdown(self, print_job):
        """Obtener desglose de costos"""
        if not print_job.estimated_cost:
            return None
        
        return {
            'estimated_cost': float(print_job.estimated_cost or 0),
            'actual_cost': float(print_job.actual_cost or 0),
            'material_cost': self.calculate_material_cost(print_job),
            'time_cost': self.calculate_time_cost(print_job),
            'is_paid': print_job.paid
        }
    
    def calculate_material_cost(self, print_job):
        """Calcular costo de material"""
        # Implementar lógica de cálculo
        return 0
    
    def calculate_time_cost(self, print_job):
        """Calcular costo por tiempo"""
        # Implementar lógica de cálculo
        return 0
    
    def get_timeline(self, print_job):
        """Obtener línea de tiempo del trabajo"""
        timeline = []
        
        if print_job.created_at:
            timeline.append({
                'event': 'submitted',
                'timestamp': print_job.created_at,
                'description': 'Trabajo enviado'
            })
        
        if print_job.approved_at:
            timeline.append({
                'event': 'approved',
                'timestamp': print_job.approved_at,
                'description': f'Aprobado por {print_job.approved_by.get_full_name() if print_job.approved_by else "Administrador"}'
            })
        
        if print_job.assigned_at:
            timeline.append({
                'event': 'assigned',
                'timestamp': print_job.assigned_at,
                'description': f'Asignado a impresora {print_job.printer.name if print_job.printer else "N/A"}'
            })
        
        if print_job.started_at:
            timeline.append({
                'event': 'started',
                'timestamp': print_job.started_at,
                'description': 'Impresión iniciada'
            })
        
        if print_job.completed_at:
            timeline.append({
                'event': 'completed',
                'timestamp': print_job.completed_at,
                'description': 'Impresión completada'
            })
        
        return sorted(timeline, key=lambda x: x['timestamp'])


# ====================
# VIEWSETS EXISTENTES (MANTENER - NO MODIFICAR)
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
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def set_password(self, request, pk=None):
        user = self.get_object()
        if user != request.user and not request.user.is_staff:
            return Response(
                {"detail": "No tienes permiso para cambiar esta contraseña"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from .serializers import PasswordChangeSerializer
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
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request):
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            
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
            
            updated_user = User.objects.get(id=user.id)
            response_serializer = CurrentUserSerializer(updated_user)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ====================
# VIEWSETS RESTANTES (MANTENER IGUAL)
# ====================

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['name', 'code', 'created_at']


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all().select_related('user', 'department')
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'user__email', 'student_id', 'phone']
    ordering_fields = ['user__username', 'role', 'created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        department_id = self.request.query_params.get('department', None)
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        is_verified = self.request.query_params.get('is_verified', None)
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        if not request.user.is_staff:
            return Response(
                {"detail": "Solo administradores pueden verificar usuarios"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        profile = self.get_object()
        profile.is_verified = True
        profile.save()
        
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
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# ====================
# VIEWSET DE PRINTJOB ORIGINAL (MANTENER PARA COMPATIBILIDAD)
# ====================

class PrintJobViewSet(viewsets.ModelViewSet):
    queryset = PrintJob.objects.all().select_related('user', 'printer', 'approved_by')
    serializer_class = PrintJobUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['file_name', 'user__username', 'job_id']
    ordering_fields = ['created_at', 'priority', 'estimated_hours', 'status']
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        if not (self.request.user.is_staff or 
                (hasattr(self.request.user, 'profile') and 
                 self.request.user.profile.role in ['TEC', 'ADM'])):
            queryset = queryset.filter(user=self.request.user)
        
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        printer_id = self.request.query_params.get('printer', None)
        if printer_id:
            queryset = queryset.filter(printer_id=printer_id)
        
        material_type = self.request.query_params.get('material', None)
        if material_type:
            queryset = queryset.filter(material_type=material_type)
        
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def my_jobs(self, request):
        queryset = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        queryset = self.get_queryset().filter(
            user=request.user,
            status__in=[JobStatus.PENDING, JobStatus.APPROVED]
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ====================
# VISTAS PERSONALIZADAS EXISTENTES (MANTENER)
# ====================

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        today = timezone.now().date()
        
        stats = {
            'total_printers': Printer.objects.filter(is_active=True).count(),
            'total_users': User.objects.filter(is_active=True).count(),
            'total_print_jobs': PrintJob.objects.count(),
            'total_departments': Department.objects.filter(active=True).count(),
            
            'printers_by_status': list(Printer.objects.filter(is_active=True)
                .values('status').annotate(count=Count('id'))),
            
            'print_jobs_by_status': list(PrintJob.objects
                .values('status').annotate(count=Count('id'))),
            
            'print_jobs_today': PrintJob.objects.filter(
                created_at__date=today
            ).count(),
            
            'users_by_role': list(UserProfile.objects
                .values('role').annotate(count=Count('id'))),
            
            'printers_needing_maintenance': Printer.objects.filter(
                is_active=True,
                total_print_hours__gte=F('maintenance_interval_hours')
            ).count(),
            
            'material_usage': list(PrintJob.objects
                .values('material_type').annotate(count=Count('id'))
                .order_by('-count')),
            
            'jobs_by_department': list(PrintJob.objects.filter(
                user__profile__department__isnull=False
            ).values('user__profile__department__name').annotate(
                count=Count('id')
            ).order_by('-count')),
            
            'total_print_hours': Printer.objects.aggregate(
                total=Sum('total_print_hours')
            )['total'] or 0,
            
            'total_revenue': PrintJob.objects.filter(
                actual_cost__isnull=False
            ).aggregate(
                total=Sum('actual_cost')
            )['total'] or 0,
        }
        
        return Response(stats)


class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            UserProfile.objects.create(
                user=user,
                role=UserRole.STUDENT,
                is_verified=False
            )
            
            UserPricingProfile.objects.create(user=user)
            
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
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip