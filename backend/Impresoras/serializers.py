import os
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.files.storage import default_storage
from .models import (
    Department, UserProfile, Printer, UserPrinterAssignment,
    PricingConfig, UserPricingProfile, PrintJob, SystemLog,
    JobStatus, PrinterStatus, UserRole, MaterialType, DepartmentType,
    PrinterType, LogAction
)


# ====================
# SERIALIZERS BÁSICOS (SIN RECURSIÓN) - CORREGIDOS
# ====================

class SimpleUserProfileSerializer(serializers.ModelSerializer):
    """Serializer SIMPLE para UserProfile (sin recursión) - VERSIÓN SEGURA"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    can_print = serializers.BooleanField(read_only=True)
    class Meta:
        model = UserProfile
        fields = ['id', 'role', 'role_display', 'department', 'department_name', 
                 'student_id', 'phone', 'address', 'is_verified', 'can_print', 'created_at', 'updated_at']
        read_only_fields = ['id', 'role', 'department', 'is_verified', 'can_print', 'created_at', 'updated_at']
        # ¡IMPORTANTE! Campos protegidos contra modificación


class UserSerializer(serializers.ModelSerializer):
    """Serializer para el modelo User de Django"""
    profile_data = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'is_active', 'is_staff', 'date_joined', 'last_login', 'profile_data']
        read_only_fields = ['id', 'is_active', 'is_staff', 'date_joined', 'last_login']
    
    def get_profile_data(self, obj):
        """Obtiene los datos del UserProfile sin recursión"""
        try:
            profile = obj.profile
            return SimpleUserProfileSerializer(profile).data
        except UserProfile.DoesNotExist:
            return None


# ====================
# SERIALIZER ESPECIAL PARA /api/users/me/ - CORREGIDO
# ====================

class CurrentUserSerializer(serializers.ModelSerializer):
    """Serializer ESPECÍFICO para la ruta /me/ - EVITA RECURSIÓN"""
    profile = SimpleUserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'is_active', 'is_staff', 'date_joined', 'last_login', 'profile']
        read_only_fields = ['id', 'username', 'is_active', 'is_staff', 'date_joined', 'last_login']


# ====================
# USERPROFILE SERIALIZER CORREGIDO - VERSIÓN SEGURA
# ====================

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer COMPLETO para UserProfile - VERSIÓN SEGURA"""
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
        """Validación personalizada para UserProfile"""
        # Solo validar si estamos creando/actualizando student_id
        if 'student_id' in data and data.get('student_id'):
            # Verificar si el usuario tiene rol de estudiante
            instance = self.instance
            if instance and instance.role == UserRole.STUDENT and not data.get('student_id'):
                raise serializers.ValidationError(
                    {"student_id": "Los estudiantes deben tener un carné de estudiante"}
                )
        return data


# ====================
# SERIALIZERS PARA CREACIÓN/ACTUALIZACIÓN
# ====================

class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear usuarios"""
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
    """Serializer para actualizar usuarios - VERSIÓN MEJORADA"""
    phone = serializers.CharField(source='profile.phone', required=False, allow_blank=True)
    address = serializers.CharField(source='profile.address', required=False, allow_blank=True)
    student_id = serializers.CharField(source='profile.student_id', required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'phone', 'address', 'student_id']
    
    def update(self, instance, validated_data):
        # Extraer datos del perfil si existen
        profile_data = {}
        if 'profile' in validated_data:
            profile_data = validated_data.pop('profile')
        
        # Actualizar usuario
        instance = super().update(instance, validated_data)
        
        # Actualizar perfil si hay datos
        if profile_data:
            try:
                profile = instance.profile
                for key, value in profile_data.items():
                    if value is not None:  # Solo actualizar si hay valor
                        setattr(profile, key, value)
                profile.save()
            except UserProfile.DoesNotExist:
                # Si no existe perfil, crear uno básico
                UserProfile.objects.create(
                    user=instance,
                    **profile_data
                )
        
        return instance


# ====================
# MODEL SERIALIZERS (MANTENER IGUAL)
# ====================

class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer para Department"""
    active_users_count = serializers.IntegerField(read_only=True)
    active_printers_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class PrinterSerializer(serializers.ModelSerializer):
    """Serializer para Printer"""
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
        """Obtiene la asignación actual activa"""
        assignment = obj.current_assignment
        if assignment:
            return {
                'user': assignment.user.username,
                'start_date': assignment.start_date,
                'end_date': assignment.end_date
            }
        return None


class UserPrinterAssignmentSerializer(serializers.ModelSerializer):
    """Serializer para UserPrinterAssignment"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    printer_name = serializers.CharField(source='printer.name', read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    is_active_assignment = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserPrinterAssignment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class PricingConfigSerializer(serializers.ModelSerializer):
    """Serializer para PricingConfig"""
    is_currently_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PricingConfig
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class UserPricingProfileSerializer(serializers.ModelSerializer):
    """Serializer para UserPricingProfile"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    available_credit = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = UserPricingProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'total_spent', 'last_payment_date']


# ... (tu código anterior se mantiene igual)

import os  # Asegúrate de tener esta importación

class PrintJobSerializer(serializers.ModelSerializer):
    """Serializer para PrintJob - VERSIÓN FUNCIONAL"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    printer_name = serializers.CharField(source='printer.name', read_only=True)
    job_duration = serializers.FloatField(read_only=True)
    can_start = serializers.BooleanField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    approved_by_username = serializers.CharField(source='approved_by.username', read_only=True)
    
    # Campo file - OBLIGATORIO
    file = serializers.FileField(write_only=True, required=True)
    
    # Campos con valores por defecto (NO required=True)
    print_time_estimate = serializers.IntegerField(
        required=False,  # No requerido - el frontend puede omitirlo
        min_value=1,
        default=60,  # Valor por defecto si no se envía
        help_text="Tiempo estimado en minutos (default: 60)"
    )
    
    material_type = serializers.ChoiceField(
        choices=MaterialType.choices,
        required=False,  # No requerido
        default=MaterialType.PLA,  # Valor por defecto
    )
    
    material_weight = serializers.FloatField(
        required=False,  # No requerido
        min_value=0.1,
        default=50.0,  # Valor por defecto
        help_text="Peso estimado en gramos (default: 50)"
    )
    
    job_name = serializers.CharField(
        required=False,
        allow_blank=True
    )
    
    # Campos opcionales con defaults
    priority = serializers.IntegerField(default=1, min_value=1, max_value=5, required=False)
    infill_percentage = serializers.IntegerField(default=20, min_value=0, max_value=100, required=False)
    layer_height = serializers.FloatField(default=0.2, min_value=0.05, max_value=0.4, required=False)
    supports = serializers.BooleanField(default=False, required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = PrintJob
        fields = '__all__'
        read_only_fields = [
            'id', 'user', 'user_username', 'file_name', 'file_size',
            'status', 'cost', 'estimated_cost', 'actual_cost', 'filament_used',
            'actual_hours', 'started_at', 'completed_at', 'approved_by',
            'approved_by_username', 'approved_at', 'error_message',
            'job_duration', 'can_start', 'can_cancel', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        """Crear PrintJob con campos automáticos"""
        request = self.context.get('request')
        file = validated_data.pop('file')
        
        # Asignar usuario automáticamente
        validated_data['user'] = request.user
        
        # Extraer nombre y tamaño del archivo
        validated_data['file_name'] = file.name
        validated_data['file_size'] = file.size
        
        # Si no se proporcionó job_name, usar el nombre del archivo
        if 'job_name' not in validated_data or not validated_data['job_name']:
            validated_data['job_name'] = os.path.splitext(file.name)[0]
        
        # Establecer estado inicial
        validated_data['status'] = JobStatus.PENDING
        
        # Crear el objeto
        print_job = PrintJob(**validated_data)
        print_job.file = file
        print_job.save()
        
        return print_job


class PrintJobSerializer(serializers.ModelSerializer):
    """Serializer para PrintJob - AJUSTADO A TU MODELO"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    printer_name = serializers.CharField(source='printer.name', read_only=True)
    job_duration = serializers.FloatField(read_only=True)
    can_start = serializers.BooleanField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    approved_by_username = serializers.CharField(source='approved_by.username', read_only=True)
    
    # Campo file - OBLIGATORIO (para subir el archivo)
    file = serializers.FileField(write_only=True, required=True)
    
    # Campos que SÍ existen en tu modelo (con defaults apropiados)
    material_type = serializers.ChoiceField(
        choices=MaterialType.choices,
        default=MaterialType.PLA,
        required=False
    )
    
    material_weight = serializers.FloatField(
        min_value=0.1,
        default=50.0,
        required=False
    )
    
    estimated_hours = serializers.FloatField(  # ¡Esto SÍ existe en tu modelo!
        min_value=0.1,
        default=2.0,  # 2 horas por defecto, no 60 minutos
        required=False,
        help_text="Horas estimadas de impresión"
    )
    
    # Campos opcionales que SÍ existen en tu modelo
    priority = serializers.IntegerField(default=5, min_value=1, max_value=10, required=False)
    infill_percentage = serializers.IntegerField(
        min_value=0, 
        max_value=100, 
        required=False,
        allow_null=True
    )
    layer_height = serializers.FloatField(min_value=0.05, required=False, allow_null=True)
    supports = serializers.BooleanField(default=False, required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = PrintJob
        fields = '__all__'
        read_only_fields = [
            'id', 'job_id', 'user', 'user_username', 'file_name', 'file_size',
            'status', 'estimated_cost', 'actual_cost', 'actual_hours',
            'started_at', 'completed_at', 'cancelled_at', 'approved_by',
            'approved_by_username', 'approved_at', 'paid', 'error_message',
            'job_duration', 'can_start', 'can_cancel', 'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """Validación del archivo"""
        request = self.context.get('request')
        
        # Validar archivo si está presente
        if 'file' in data:
            file = data['file']
            
            # Validar extensión
            allowed_extensions = ['.stl', '.obj', '.gcode', '.3mf']
            file_ext = os.path.splitext(file.name)[1].lower()
            
            if file_ext not in allowed_extensions:
                raise serializers.ValidationError({
                    "file": f"Extensión no permitida. Use: {', '.join(allowed_extensions)}"
                })
            
            # Validar tamaño (50MB máximo)
            max_size = 50 * 1024 * 1024
            if file.size > max_size:
                raise serializers.ValidationError({
                    "file": f"Archivo demasiado grande. Máximo: {max_size/(1024*1024)}MB"
                })
        
        return data
    
    def create(self, validated_data):
        """Crear PrintJob según TU modelo"""
        request = self.context.get('request')
        file = validated_data.pop('file')
        
        # Asignar usuario automáticamente
        validated_data['user'] = request.user
        
        # Usar file.name como file_name (esto SÍ existe en tu modelo)
        validated_data['file_name'] = file.name
        validated_data['file_size'] = file.size
        
        # Establecer estado inicial (esto SÍ existe)
        validated_data['status'] = JobStatus.PENDING
        
        # Convertir print_time_estimate a estimated_hours si es necesario
        # (Tu frontend puede enviar print_time_estimate en minutos, lo convertimos a horas)
        if 'print_time_estimate' in validated_data:
            # Si el frontend envía minutos, convertir a horas
            minutes = validated_data.pop('print_time_estimate')
            validated_data['estimated_hours'] = minutes / 60.0
        elif 'estimated_hours' not in validated_data:
            # Valor por defecto: 2 horas
            validated_data['estimated_hours'] = 2.0
        
        # Si el frontend envía job_name, podemos usarlo como notes
        if 'job_name' in validated_data:
            job_name = validated_data.pop('job_name')
            if 'notes' not in validated_data or not validated_data['notes']:
                validated_data['notes'] = job_name
        
        # Crear el objeto
        print_job = PrintJob(**validated_data)
        print_job.file_url = f"/media/print_jobs/{file.name}"  # URL temporal
        print_job.file = file
        print_job.save()
        
        return print_job


# ... (el resto de tu código se mantiene igual)


class PrintJobStatusUpdateSerializer(serializers.Serializer):
    """Serializer para actualizar estado de PrintJob"""
    status = serializers.ChoiceField(choices=JobStatus.choices)
    actual_hours = serializers.FloatField(required=False, min_value=0.1)
    error_message = serializers.CharField(required=False, allow_blank=True)


class SystemLogSerializer(serializers.ModelSerializer):
    """Serializer para SystemLog"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = SystemLog
        fields = '__all__'
        read_only_fields = ['log_id', 'created_at']


# ====================
# NESTED SERIALIZERS (ACTUALIZADOS)
# ====================

class PrinterDetailSerializer(PrinterSerializer):
    """Serializer detallado para Printer con trabajos relacionados"""
    print_jobs = PrintJobSerializer(many=True, read_only=True)
    user_assignments = UserPrinterAssignmentSerializer(many=True, read_only=True)


class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para User - VERSIÓN SIN RECURSIÓN"""
    profile = SimpleUserProfileSerializer(read_only=True)
    print_jobs = PrintJobSerializer(many=True, read_only=True)
    printer_assignments = UserPrinterAssignmentSerializer(many=True, read_only=True)
    pricing_profile = UserPricingProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'profile', 'print_jobs', 'printer_assignments', 'pricing_profile']