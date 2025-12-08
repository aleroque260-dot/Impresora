# Impresoras/urls.py - VERSIÓN CORREGIDA
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import UserProfileUpdateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'departments', views.DepartmentViewSet, basename='department')
router.register(r'profiles', views.UserProfileViewSet, basename='userprofile')
router.register(r'printers', views.PrinterViewSet, basename='printer')
router.register(r'assignments', views.UserPrinterAssignmentViewSet, basename='assignment')
router.register(r'pricing-configs', views.PricingConfigViewSet, basename='pricingconfig')
router.register(r'user-pricing-profiles', views.UserPricingProfileViewSet, basename='userpricingprofile')
router.register(r'print-jobs', views.PrintJobViewSet, basename='printjob')  # Esto crea rutas automáticas
router.register(r'logs', views.SystemLogViewSet, basename='systemlog')

urlpatterns = [
    # Incluye TODAS las rutas del router
    path('', include(router.urls)),
    
    # JWT Authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Custom endpoints
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard_stats'),
    
    # Endpoint alternativo para actualizar perfil
    path('users/update-profile/', UserProfileUpdateView.as_view(), name='user-update-profile'),
    
    # ⚠️ NO necesitas estas rutas porque el router ya las crea
    # ELIMINA estas líneas:
    # path('print-jobs/my-jobs/', views.PrintJobViewSet.as_view({'get': 'list'}), name='my-jobs'),
    # path('print-jobs/pending/', views.PrintJobViewSet.as_view({'get': 'pending_jobs'}), name='pending-jobs'),
    
    # ENDPOINTS CORRECTOS (con @action decorator):
    # El router automáticamente crea: /api/print-jobs/my_jobs/ desde @action
    # El router automáticamente crea: /api/print-jobs/pending/ desde @action
    
    # User Pricing Profiles endpoints
    path('user-pricing-profiles/me/', 
         views.UserPricingProfileViewSet.as_view({'get': 'me'}), 
         name='userpricingprofile-me'),
    
    path('user-pricing-profiles/my_balance/', 
         views.UserPricingProfileViewSet.as_view({'get': 'my_balance'}), 
         name='userpricingprofile-my-balance'),
    
    path('user-pricing-profiles/quick_info/', 
         views.UserPricingProfileViewSet.as_view({'get': 'quick_info'}), 
         name='userpricingprofile-quick-info'),
]