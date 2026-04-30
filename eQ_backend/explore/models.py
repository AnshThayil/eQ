from django.db import models


class ServiceGroup(models.Model):
    """Parent model representing a service umbrella (e.g., 'Monthly Membership', 'Yoga Classes')."""
    
    SERVICE_TYPES = [
        ('membership', 'Membership'),
        ('class', 'Class'),
        ('event', 'Event'),
    ]
    
    name = models.CharField(max_length=200, help_text="Service family name (e.g., 'Monthly Membership')")
    gym = models.ForeignKey(
        'logger.Gym',
        related_name='service_groups',
        on_delete=models.CASCADE,
        help_text='Gym that owns this service group',
    )
    description = models.TextField(blank=True)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    
    # YoActiv grouping identifier - can map to multiple internal service groups
    yoactiv_service_id = models.CharField(
        max_length=100, 
        db_index=True,
        help_text="YoActiv service ID - groups all variations of this service"
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['gym', 'name', 'yoactiv_service_id'],
                name='unique_servicegroup_gym_name_yoactiv_id',
            )
        ]
    
    def __str__(self):
        return f"{self.name} - {self.gym.name} ({self.get_service_type_display()})"


class Service(models.Model):
    """Represents specific service variations (e.g., '1 Month', '3 Month', 'Premium')."""
    
    ACCESS_TYPES = [
        ('sessions', 'Number of Sessions'),
        ('unlimited', 'Unlimited'),
        ('single_day', 'Single Day Access'),
    ]
    
    # Parent relationship
    service_group = models.ForeignKey(
        ServiceGroup, 
        related_name='variations', 
        on_delete=models.CASCADE,
        help_text="Parent service group"
    )
    
    # Variation-specific details
    name = models.CharField(max_length=200, help_text="Variation name (e.g., '1 Month', 'Premium', '10 Sessions')")
    access_type = models.CharField(max_length=20, choices=ACCESS_TYPES)
    
    # For 'sessions' access type, this holds the number of sessions offered
    # For 'unlimited' and 'single_day', this can be null
    num_sessions = models.PositiveIntegerField(null=True, blank=True)
    
    # Pricing and duration
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField(
        null=True, 
        blank=True, 
        help_text="Duration in days for time-limited services"
    )
    
    # YoActiv variation identifier
    yoactiv_service_variation_id = models.CharField(
        max_length=100, 
        blank=True, 
        help_text="YoActiv service variation ID"
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['price']
        unique_together = [['service_group', 'yoactiv_service_variation_id']]
    
    def __str__(self):
        return f"{self.service_group.name} - {self.name} (${self.price})"
