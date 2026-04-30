from django.contrib import admin
from .models import Service, ServiceGroup
from .forms import ServiceGroupAdminForm, ServiceAdminForm


@admin.register(ServiceGroup)
class ServiceGroupAdmin(admin.ModelAdmin):
    form = ServiceGroupAdminForm
    list_display = ['name', 'service_type', 'yoactiv_service_id', 'is_active']
    list_filter = ['service_type', 'is_active']
    search_fields = ['name', 'description', 'yoactiv_service_id']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'service_type', 'description')
        }),
        ('YoActiv Integration', {
            'fields': ('yoactiv_service_id',),
            'description': 'Select a service from YoActiv. The service ID will be automatically populated.',
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    form = ServiceAdminForm
    list_display = [
        'name', 
        'service_group', 
        'access_type', 
        'num_sessions', 
        'price',
        'is_active'
    ]
    list_filter = [
        'service_group__service_type', 
        'access_type', 
        'is_active'
    ]
    search_fields = ['name', 'service_group__name', 'yoactiv_service_variation_id']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('service_group', 'name', 'access_type', 'is_active')
        }),
        ('Access Details', {
            'fields': ('num_sessions',)
        }),
        ('Pricing & Duration', {
            'fields': ('price', 'duration_days')
        }),
        ('YoActiv Integration', {
            'fields': ('yoactiv_service_variation_id',),
            'description': 'Select a variation from YoActiv. The variation ID will be automatically populated.',
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('service_group')