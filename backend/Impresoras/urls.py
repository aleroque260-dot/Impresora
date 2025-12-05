# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from Impresoras import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'departments', views.DepartmentViewSet)
router.register(r'profiles', views.UserProfileViewSet)
router.register(r'printers', views.PrinterViewSet)
router.register(r'assignments', views.UserPrinterAssignmentViewSet)
router.register(r'pricing-configs', views.PricingConfigViewSet)
router.register(r'pricing-profiles', views.UserPricingProfileViewSet)
router.register(r'print-jobs', views.PrintJobViewSet)
router.register(r'logs', views.SystemLogViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', views.UserRegistrationView.as_view(), name='register'),
    path('api/dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard_stats'),
]