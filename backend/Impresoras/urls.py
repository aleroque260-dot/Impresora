# Impresoras/urls.py - VERSIÓN CORREGIDA
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import UserProfileUpdateView

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
    
    # Custom endpoints
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard_stats'),
    
    # ¡¡¡COMENTA O ELIMINA ESTA LÍNEA!!! El router ya maneja users/me/
    # path('users/me/', views.UserViewSet.as_view({'get': 'me'}), name='user-me'),
    
    # Endpoint alternativo si lo prefieres
    path('users/update-profile/', UserProfileUpdateView.as_view(), name='user-update-profile'),
]