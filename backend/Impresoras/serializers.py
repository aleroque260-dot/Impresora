import os
import uuid
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import (
    Department, UserProfile, Printer, UserPrinterAssignment,
    PricingConfig, UserPricingProfile, PrintJob, SystemLog,
    JobStatus, PrinterStatus, UserRole, MaterialType, DepartmentType,
    PrinterType, LogAction
)

# ====================
# SERIALIZERS BÁSICOS (MANTENER)
# ====================

class SimpleUserProfileSerializer(serializers.ModelSerializer):
    """Serializer SIMPLE para UserProfile"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    can_print = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'role', 'role_display', 'department', 'department_name', 
                 'student_id', 'phone', 'address', 'is_verified', 'can_print', 'created_at', 'updated_at']
        read_only_fields = ['id', 'role', 'department', 'is_verified', 'can_print', 'created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    profile_data = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'is_active', 'is_staff', 'date_joined', 'last_login', 'profile_data']
        read_only_fields = ['id', 'is_active', 'is_staff', 'date_joined', 'last_login']
    
    def get_profile_data(self, obj):
        try:
            profile = obj.profile
            return SimpleUserProfileSerializer(profile).data
        except UserProfile.DoesNotExist:
            return None

# ====================
# FLUJO COMPLETO DE PRINTJOB - SERIALIZERS NUEVOS
# ====================

class PrintJobUploadSerializer(serializers.ModelSerializer):
    """Serializer ESPECÍFICO para subida de archivos"""
    file = serializers.FileField(write_only=True, required=True)
    job_name = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = PrintJob
        fields = [
            'file', 'job_name', 'material_type', 'material_weight', 
            'estimated_hours', 'layer_height', 'infill_percentage', 
            'supports', 'notes', 'priority'
        ]
    
    def validate(self, data):
        # Validar archivo
        file = data.get('file')
        if file:
            allowed_extensions = ['.stl', '.obj', '.gcode', '.3mf', '.zip']
            file_ext = os.path.splitext(file.name)[1].lower()
            
            if file_ext not in allowed_extensions:
                raise serializers.ValidationError({
                    "file": f"Formato no permitido. Use: {', '.join(allowed_extensions)}"
                })
            
            max_size = 100 * 1024 * 1024  # 100MB
            if file.size > max_size:
                raise serializers.ValidationError({
                    "file": f"Archivo demasiado grande. Máximo: {max_size/(1024*1024)}MB"
                })
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        file = validated_data.pop('file')
        job_name = validated_data.pop('job_name', None)
        # Validar archivo
        allowed_extensions = ['.stl', '.obj', '.gcode', '.3mf', '.zip']
        file_ext = os.path.splitext(file.name)[1].lower()
    
        if file_ext not in allowed_extensions:
             raise serializers.ValidationError({
            "file": f"Formato no permitido. Use: {', '.join(allowed_extensions)}"
        })
    
        # Crear PrintJob
        print_job = PrintJob.objects.create(
        user=request.user,
        file_name=file.name,
        file_size=file.size,
        file_url=f"/media/print_jobs/{uuid.uuid4()}_{file.name}",
        status=JobStatus.PENDING,
             **validated_data
    )
    
        # Asignar nombre si se proporcionó
        if job_name:
         print_job.notes = job_name
        print_job.save()
    
        return print_job

class PrintJobListSerializer(serializers.ModelSerializer):
    """Serializer para listar trabajos"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    material_display = serializers.CharField(source='get_material_type_display', read_only=True)
    
    class Meta:
        model = PrintJob
        fields = [
            'id', 'job_id', 'user', 'user_name', 'user_email',
            'file_name', 'file_size', 'material_type', 'material_display',
            'estimated_hours', 'status', 'status_display', 'priority',
            'created_at', 'updated_at', 'notes'
        ]

class PrintJobDetailSerializer(serializers.ModelSerializer):
    """Serializer para detalle de trabajo"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.profile.get_role_display', read_only=True)
    printer_name = serializers.CharField(source='printer.name', read_only=True)
    printer_status = serializers.CharField(source='printer.status', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    material_display = serializers.CharField(source='get_material_type_display', read_only=True)
    
    class Meta:
        model = PrintJob
        fields = '__all__'
        read_only_fields = ['job_id', 'user', 'file_name', 'file_size', 'created_at']

class PrintJobReviewSerializer(serializers.ModelSerializer):
    """Serializer para revisión por admin"""
    user_info = serializers.SerializerMethodField()
    department_info = serializers.SerializerMethodField()
    estimated_cost = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = PrintJob
        fields = [
            'id', 'job_id', 'user_info', 'department_info',
            'file_name', 'file_size', 'material_type', 'material_weight',
            'estimated_hours', 'estimated_cost', 'layer_height', 
            'infill_percentage', 'supports', 'priority', 'notes',
            'status', 'created_at'
        ]
        read_only_fields = ['job_id', 'file_name', 'file_size', 'created_at']
    
    def get_user_info(self, obj):
        return {
            'id': obj.user.id,
            'name': obj.user.get_full_name(),
            'email': obj.user.email,
            'role': obj.user.profile.get_role_display() if hasattr(obj.user, 'profile') else 'Sin rol'
        }
    
    def get_department_info(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile.department:
            return {
                'id': obj.user.profile.department.id,
                'name': obj.user.profile.department.name,
                'code': obj.user.profile.department.code
            }
        return None

class PrintJobApproveSerializer(serializers.ModelSerializer):
    """Serializer para aprobar/rechazar trabajos"""
    action = serializers.ChoiceField(choices=['approve', 'reject'], write_only=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = PrintJob
        fields = ['action', 'rejection_reason']
    
    def validate(self, data):
        if data.get('action') == 'reject' and not data.get('rejection_reason'):
            raise serializers.ValidationError({
                'rejection_reason': 'Debe proporcionar una razón para el rechazo'
            })
        return data

class PrintJobAssignmentSerializer(serializers.ModelSerializer):
    """Serializer para asignar impresora"""
    printer_name = serializers.CharField(source='printer.name', read_only=True)
    printer_status = serializers.CharField(source='printer.status', read_only=True)
    printer_type = serializers.CharField(source='printer.printer_type', read_only=True)
    
    class Meta:
        model = PrintJob
        fields = ['id', 'printer', 'printer_name', 'printer_status', 'printer_type', 'assigned_at']
    
    def validate(self, data):
        printer = data.get('printer')
        
        # Verificar que la impresora existe y está disponible
        if not printer:
            raise serializers.ValidationError({'printer': 'Debe seleccionar una impresora'})
        
        if not printer.is_active:
            raise serializers.ValidationError({'printer': 'La impresora no está activa'})
        
        if printer.status != PrinterStatus.AVAILABLE:
            raise serializers.ValidationError({'printer': 'La impresora no está disponible'})
        
        return data

class PrintJobStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar estado (printing, completed, failed)"""
    class Meta:
        model = PrintJob
        fields = ['status', 'actual_hours', 'error_message']
    
    def validate(self, data):
        current_status = self.instance.status
        new_status = data.get('status')
        
        # Validar transiciones válidas
        valid_transitions = {
            JobStatus.APPROVED: [JobStatus.PRINTING, JobStatus.CANCELLED],
            JobStatus.PRINTING: [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.PAUSED],
            JobStatus.PAUSED: [JobStatus.PRINTING, JobStatus.CANCELLED],
        }
        
        if new_status not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError({
                'status': f'No se puede cambiar de {current_status} a {new_status}'
            })
        
        # Validar horas reales si se completa
        if new_status == JobStatus.COMPLETED and not data.get('actual_hours'):
            raise serializers.ValidationError({
                'actual_hours': 'Debe proporcionar las horas reales de impresión'
            })
        
        # Validar mensaje de error si falla
        if new_status == JobStatus.FAILED and not data.get('error_message'):
            raise serializers.ValidationError({
                'error_message': 'Debe proporcionar el motivo del fallo'
            })
        
        return data

class UserNotificationSerializer(serializers.ModelSerializer):
    """Serializer para notificaciones de usuario"""
    job_info = serializers.SerializerMethodField()
    status_change = serializers.SerializerMethodField()
    
    class Meta:
        model = PrintJob
        fields = ['id', 'job_id', 'job_info', 'status', 'status_change', 'updated_at']
    
    def get_job_info(self, obj):
        return {
            'file_name': obj.file_name,
            'material': obj.get_material_type_display(),
            'estimated_hours': obj.estimated_hours
        }
    
    def get_status_change(self, obj):
        return {
            'from': 'previous_status_placeholder',  # Necesitarías tracking de cambios
            'to': obj.status,
            'message': self.get_status_message(obj)
        }
    
    def get_status_message(self, obj):
        messages = {
            JobStatus.PENDING: "Tu trabajo está pendiente de revisión",
            JobStatus.APPROVED: "¡Tu trabajo ha sido aprobado!",
            JobStatus.REJECTED: "Tu trabajo ha sido rechazado",
            JobStatus.PRINTING: "Tu trabajo está siendo impreso",
            JobStatus.COMPLETED: "¡Tu trabajo se ha completado!",
            JobStatus.FAILED: "Tu trabajo ha fallado durante la impresión",
            JobStatus.CANCELLED: "Tu trabajo ha sido cancelado",
        }
        return messages.get(obj.status, "Estado actualizado")

# ====================
# SERIALIZERS EXISTENTES (MANTENER)
# ====================

class CurrentUserSerializer(serializers.ModelSerializer):
    profile = SimpleUserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'is_active', 'is_staff', 'date_joined', 'last_login', 'profile']
        read_only_fields = ['id', 'username', 'is_active', 'is_staff', 'date_joined', 'last_login']

class UserProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    can_print = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user_id', 'username', 'email', 'first_name', 'last_name', 
                 'full_name', 'role', 'role_display', 'department', 'department_name',
                 'student_id', 'phone', 'address', 'is_verified','can_print', 'max_concurrent_jobs',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_id', 'username', 'email', 'first_name', 'last_name',
                           'full_name', 'role', 'department', 'is_verified', 'can_print',
                           'max_concurrent_jobs', 'created_at', 'updated_at']
    
    def validate(self, data):
        if 'student_id' in data and data.get('student_id'):
            instance = self.instance
            if instance and instance.role == UserRole.STUDENT and not data.get('student_id'):
                raise serializers.ValidationError(
                    {"student_id": "Los estudiantes deben tener un carné de estudiante"}
                )
        return data

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='profile.phone', required=False, allow_blank=True)
    address = serializers.CharField(source='profile.address', required=False, allow_blank=True)
    student_id = serializers.CharField(source='profile.student_id', required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'phone', 'address', 'student_id']
    
    def update(self, instance, validated_data):
        profile_data = {}
        if 'profile' in validated_data:
            profile_data = validated_data.pop('profile')
        
        instance = super().update(instance, validated_data)
        
        if profile_data:
            try:
                profile = instance.profile
                for key, value in profile_data.items():
                    if value is not None:
                        setattr(profile, key, value)
                profile.save()
            except UserProfile.DoesNotExist:
                UserProfile.objects.create(user=instance, **profile_data)
        
        return instance

class DepartmentSerializer(serializers.ModelSerializer):
    active_users_count = serializers.IntegerField(read_only=True)
    active_printers_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

# ====================
# SERIALIZERS ORIGINALES (CORREGIDOS)
# ====================

class PrinterSerializer(serializers.ModelSerializer):
    build_volume = serializers.FloatField(read_only=True)
    needs_maintenance = serializers.BooleanField(read_only=True)
    can_print = serializers.BooleanField(read_only=True)
    current_assignment = serializers.SerializerMethodField()
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Printer
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'total_print_hours']
    
    def get_current_assignment(self, obj):
        assignment = obj.current_assignment
        if assignment:
            return {
                'user': assignment.user.username,
                'start_date': assignment.start_date,
                'end_date': assignment.end_date
            }
        return None

class UserPrinterAssignmentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    printer_name = serializers.CharField(source='printer.name', read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    is_active_assignment = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserPrinterAssignment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class PricingConfigSerializer(serializers.ModelSerializer):
    is_currently_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PricingConfig
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class UserPricingProfileSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    available_credit = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = UserPricingProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'total_spent', 'last_payment_date']

class SystemLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = SystemLog
        fields = '__all__'
        read_only_fields = ['log_id', 'created_at']

# ====================
# SERIALIZERS NESTED (MANTENER)
# ====================

class PrinterDetailSerializer(PrinterSerializer):
    print_jobs = PrintJobListSerializer(many=True, read_only=True)
    user_assignments = UserPrinterAssignmentSerializer(many=True, read_only=True)

class UserDetailSerializer(serializers.ModelSerializer):
    profile = SimpleUserProfileSerializer(read_only=True)
    print_jobs = PrintJobListSerializer(many=True, read_only=True)
    printer_assignments = UserPrinterAssignmentSerializer(many=True, read_only=True)
    pricing_profile = UserPricingProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'profile', 'print_jobs', 'printer_assignments', 'pricing_profile']