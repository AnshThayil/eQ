"""
Django admin forms for integrating YoActiv API with service management.
Provides dynamic dropdowns for selecting services and variations from YoActiv.
"""

from django import forms
from django.core.exceptions import ValidationError

from .models import Service, ServiceGroup
from .yoactiv_admin_integration import (
    get_service_choices,
    get_variation_choices,
)


class ServiceGroupAdminForm(forms.ModelForm):
    """
    Custom form for ServiceGroup admin. The yoactiv_service_id dropdown is
    populated dynamically via JavaScript based on the selected gym, using
    that gym's branch_id to query YoActiv instead of the env-var default.
    """

    # Use CharField+Select so JS can populate choices dynamically without
    # Django performing choice-list validation on submit.
    yoactiv_service_id = forms.CharField(
        required=True,
        widget=forms.Select(choices=[]),
        help_text="Select a gym first, then choose a service from YoActiv",
        label="YoActiv Service"
    )

    class Meta:
        model = ServiceGroup
        fields = ['gym', 'name', 'description', 'service_type', 'yoactiv_service_id', 'is_active']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        initial_choices = [('', '--- Select a gym first ---')]

        # If editing an existing instance that already has a gym with a branch_id,
        # pre-load the services for that gym so the dropdown has a value on page load.
        if self.instance and self.instance.pk:
            try:
                gym = self.instance.gym
                if gym and gym.branch_id:
                    initial_choices = [
                        ('', '--- Select a service ---'),
                    ] + get_service_choices(branch_id=gym.branch_id)
            except Exception:
                pass

        self.fields['yoactiv_service_id'].widget.choices = initial_choices

    class Media:
        js = ('admin/service_group_admin.js',)


class ServiceAdminForm(forms.ModelForm):
    """
    Custom form for Service admin that provides a dropdown to select
    from live YoActiv service variations. Includes JavaScript to:
    - Auto-load variations when service_group is selected
    - Auto-populate fields (name, price, access_type) when variation is selected
    """
    
    # Use CharField with Select widget to avoid choice validation issues
    # JavaScript will populate options dynamically
    yoactiv_service_variation_id = forms.CharField(
        required=False,
        widget=forms.Select(choices=[]),
        help_text="Select a variation from YoActiv for this service",
        label="YoActiv Service Variation"
    )
    
    class Meta:
        model = Service
        fields = [
            'service_group',
            'name',
            'access_type',
            'num_sessions',
            'price',
            'duration_days',
            'yoactiv_service_variation_id',
            'is_active'
        ]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set initial choices for the widget - JavaScript will dynamically load variations
        # Only try to populate if editing an existing instance with a service_group
        service_group = None
        initial_choices = [('', '--- Select a service group first ---')]
        
        # Check if this is an existing instance with a service_group
        if self.instance and self.instance.pk:
            try:
                service_group = self.instance.service_group
            except ServiceGroup.DoesNotExist:
                service_group = None
        
        # If editing an existing service with a service_group, try to load variations
        if service_group and service_group.yoactiv_service_id:
            try:
                initial_choices = [
                    ('', '--- Select a variation ---'),
                ] + get_variation_choices(service_group.yoactiv_service_id)
            except Exception:
                # If API fails, just show empty dropdown - JavaScript will handle it
                initial_choices = [('', '--- Select a service group first ---')]
        
        # Set choices on the widget (not the field, since it's a CharField)
        self.fields['yoactiv_service_variation_id'].widget.choices = initial_choices
    
    class Media:
        """Include JavaScript for dynamic form behavior in Django admin."""
        js = ('admin/service_admin.js',)
    
    def clean(self):
        """Validate that service_group has a yoactiv_service_id."""
        cleaned_data = super().clean()
        service_group = cleaned_data.get('service_group')
        
        if service_group and not service_group.yoactiv_service_id:
            raise ValidationError(
                "The selected service group does not have a YoActiv service ID. "
                "Please select a different service group or create one with a valid YoActiv service."
            )
        
        return cleaned_data
