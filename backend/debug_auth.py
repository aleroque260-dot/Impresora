# debug_auth.py
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

print("="*70)
print("🔐 DIAGNÓSTICO DE AUTENTICACIÓN JWT")
print("="*70)

# 1. Listar usuarios
print("\n1. 👥 USUARIOS EN EL SISTEMA:")
users = User.objects.all()
for u in users:
    print(f"   {u.id}: {u.username} (Active: {u.is_active}, Staff: {u.is_staff})")

# 2. Probar autenticación con cada usuario
print("\n2. 🧪 PROBAR AUTENTICACIÓN:")
test_passwords = ['admin123', 'Admin123!', 'password', 'admin']

for user in users:
    print(f"\n   Probando usuario: {user.username}")
    
    for pwd in test_passwords:
        auth_user = authenticate(username=user.username, password=pwd)
        if auth_user:
            print(f"     ✅ Password correcta: '{pwd}'")
            
            # Probar crear token JWT
            try:
                refresh = RefreshToken.for_user(auth_user)
                print(f"     ✅ Token JWT creado exitosamente")
                print(f"     Access Token: {str(refresh.access_token)[:50]}...")
                break
            except Exception as e:
                print(f"     ❌ Error creando token: {e}")
    
    if not any(authenticate(username=user.username, password=pwd) for pwd in test_passwords):
        print(f"     ❌ Ninguna contraseña de prueba funcionó")

# 3. Verificar configuración JWT
print("\n3. ⚙️ CONFIGURACIÓN JWT:")
try:
    from django.conf import settings
    print(f"   INSTALLED_APPS tiene rest_framework_simplejwt: {'rest_framework_simplejwt' in settings.INSTALLED_APPS}")
    print(f"   REST_FRAMEWORK config: {hasattr(settings, 'REST_FRAMEWORK')}")
    
    if hasattr(settings, 'REST_FRAMEWORK'):
        rf = settings.REST_FRAMEWORK
        print(f"   DEFAULT_AUTHENTICATION_CLASSES: {rf.get('DEFAULT_AUTHENTICATION_CLASSES', [])}")
except Exception as e:
    print(f"   Error: {e}")

# 4. Probar endpoint directamente
print("\n4. 🌐 PROBAR ENDPOINT CON CURL:")
for user in users:
    print(f"\n   Para usuario '{user.username}':")
    print(f"   curl -X POST http://localhost:8000/api/token/ \\")
    print(f"     -H \"Content-Type: application/json\" \\")
    print(f"     -d '{{\"username\":\"{user.username}\",\"password\":\"Admin123!\"}}'")

print("\n" + "="*70)
print("💡 SOLUCIONES:")
print("="*70)
print("1. Si no hay usuarios: python manage.py createsuperuser")
print("2. Si el usuario existe pero no activo: user.is_active = True")
print("3. Si password incorrecta: python manage.py changepassword <username>")
print("4. Si JWT no configurado: verifica settings.py")
print("\nProbablemente necesites usar: Username: admin, Password: Admin123!")