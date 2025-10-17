from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class Gym(models.Model):

    name = models.CharField(max_length=100)

    def __str__(self):

        return self.name


class Wall(models.Model):

    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='walls')
    name = models.CharField(max_length=100)


    class Meta:
        unique_together = ("gym", "name")
    
    def __str__(self):
        return f"{self.name} at {self.gym}"

class Boulder(models.Model):

    wall = models.ForeignKey(Wall, on_delete=models.CASCADE, related_name="boulders")
    setter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='setter')
    setter_grade = models.CharField(max_length=10, blank=True)
    concensus_grade = models.CharField(max_length=10, blank=True)
    color = models.CharField(max_length=30, blank=True)
    date_set = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)


    class Meta:
        unique_together = ("wall", "setter_grade", "color", "is_active")
    
    def __str__(self):
        return f"{self.setter_grade} {self.color} on {self.wall}"


class Ascent(models.Model):
    ASCENT_TYPES = [
        ("flash", "Flash"),
        ("send", "Send"),
    ]

    climber = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ascents")
    boulder = models.ForeignKey(Boulder, on_delete=models.CASCADE, related_name="ascents")
    ascent_type = models.CharField(max_length=20, choices=ASCENT_TYPES)
    date_climbed = models.DateField(auto_now_add=True)
    points = models.PositiveIntegerField(default=0)


    class Meta:
        unique_together = ("climber", "boulder")
    
    def __str__(self):
        return f"{self.climber.username} - {self.boulder} ({self.ascent_type})"