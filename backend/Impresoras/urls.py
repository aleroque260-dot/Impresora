# Impresoras/urls.py - COMPLETO
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'departments', views.DepartmentViewSet, basename='department')
router.register(r'profiles', views.UserProfileViewSet, basename='userprofile')
router.register(r'printers', views.PrinterViewSet, basename='printer')
router.register(r'assignments', views.UserPrinterAssignmentViewSet, basename='assignment')
router.register(r'pricing-configs', views.PricingConfigViewSet, basename='pricingconfig')
router.register(r'pricing-profiles', views.UserPricingProfileViewSet, basename='userpricingprofile')
router.register(r'print-jobs', views.PrintJobViewSet, basename='printjob')
router.register(r'logs', views.SystemLogViewSet, basename='systemlog')

urlpatterns = [
    # Incluye TODAS las rutas del router
    path('', include(router.urls)),
    
    # Custom endpoints - ¡PERO OJO CON LOS PREFIX!
    # Estos ya están bajo /api/ porque config/urls.py tiene path('api/', include('Impresoras.urls'))
    # Así que NO pongas 'api/' aquí de nuevo
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard_stats'),
    
    # ¡¡¡IMPORTANTE!!! Ruta MANUAL para users/me/
    # Se accederá como /api/users/me/ (porque está bajo /api/)
    path('users/me/', views.UserViewSet.as_view({'get': 'me'}), name='user-me'),
]