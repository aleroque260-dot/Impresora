from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
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


class PrintJobSerializer(serializers.ModelSerializer):
    """Serializer para PrintJob"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    printer_name = serializers.CharField(source='printer.name', read_only=True)
    job_duration = serializers.FloatField(read_only=True)
    can_start = serializers.BooleanField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    approved_by_username = serializers.CharField(source='approved_by.username', read_only=True)
    file = serializers.FileField(write_only=True, required=True)
    
      # Campos con valores por defecto inteligentes
    material_type = serializers.ChoiceField(
        choices=MaterialType.choices,
        default=MaterialType.PLA
    )
    
    material_weight = serializers.FloatField(
        required=False,
        min_value=0.1,
        default=50.0  # Peso promedio por defecto
    )
    
    estimated_hours = serializers.FloatField(
        required=False,
        min_value=0.1,
        default=2.0  # Tiempo promedio por defecto
    )
    
    supports = serializers.BooleanField(default=False)
    
    class Meta:
        model = PrintJob
        fields = '__all__'
        read_only_fields = ['job_id', 'created_at', 'updated_at', 'actual_cost']
    
    def create(self, validated_data):
        """Calcula costo estimado al crear el trabajo"""
        print_job = super().create(validated_data)
        
        # Calcular costo estimado
        try:
            profile = print_job.user.profile
            pricing_profile = print_job.user.pricing_profile
            print_job.estimated_cost = pricing_profile.calculate_cost(
                hours=print_job.estimated_hours,
                material_weight=print_job.material_weight,
                material_type=print_job.material_type,
                user_role=profile.role
            )
            print_job.save()
        except Exception as e:
            # Si hay error en cálculo, continuar sin costo estimado
            pass
        
        return print_job


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