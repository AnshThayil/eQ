from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class Gym(models.Model):

    name = models.CharField(max_length=100)
    branch_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        unique=True,
        help_text="YoActiv branch ID for this gym",
    )
    setting_day = models.IntegerField(
        null=True,
        blank=True,
        help_text="Recurring weekly setting/reset day (0=Monday ... 6=Sunday)",
    )
    zones_per_reset = models.PositiveIntegerField(
        default=2,
        help_text="Default number of zones reset together each setting day. The queue auto-rolls in batches of this size, one week apart.",
    )

    def __str__(self):

        return self.name


class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    phone_number = models.CharField(
        max_length=30,
        blank=True,
        null=True,
        help_text='Phone number used by the external CRM',
    )

    def __str__(self):
        return f"Profile for {self.user.username}"


class Wall(models.Model):

    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='walls')
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(
        default=0,
        help_text="Position in the setting queue (lower = sooner). 0 is 'up next'.",
    )
    last_set = models.DateField(
        null=True,
        blank=True,
        help_text="Date this wall's routes were last reset/set.",
    )
    next_reset = models.DateField(
        null=True,
        blank=True,
        help_text="Manual override for the next reset date. If blank, it is computed from the gym setting day and queue order.",
    )


    class Meta:
        unique_together = ("gym", "name")
        ordering = ["order", "id"]
    
    def __str__(self):
        return f"{self.name} at {self.gym}"

class Boulder(models.Model):
    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    ]
    
    STYLE_CHOICES = [
        ("technical", "Technical"),
        ("power", "Power"),
        ("slab", "Slab"),
        ("coordination", "Coordination"),
        ("electric", "Electric"),
    ]

    GRADE_CHOICES = [
        ("L1", "L1"),
        ("L2", "L2"),
        ("L3", "L3"),
        ("L4", "L4"),
        ("L5", "L5"),
        ("L6", "L6"),
        ("L7", "L7"),
        ("L8", "L8"),
    ]

    wall = models.ForeignKey(Wall, on_delete=models.CASCADE, related_name="boulders")
    setter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='setter')
    tester = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tested_boulders')
    comments = models.TextField(blank=True, default="")
    setter_grade = models.CharField(max_length=10, choices=GRADE_CHOICES, blank=True)
    color = models.CharField(max_length=30, blank=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, blank=True)
    climbing_style = models.CharField(max_length=20, choices=STYLE_CHOICES, blank=True)
    date_set = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    num_ascents = models.PositiveIntegerField(default=0)


    class Meta:
        unique_together = ("wall", "setter_grade", "color", "is_active")
    
    def __str__(self):
        return f"{self.setter_grade} {self.color} on {self.wall}"


class Ascent(models.Model):
    ASCENT_TYPES = [
        ("flash", "Flash"),
        ("send", "Send"),
    ]

    # Point values for each grade level
    GRADE_POINTS = {
        "L1": 10,
        "L2": 20,
        "L3": 30,
        "L4": 40,
        "L5": 50,
        "L6": 60,
        "L7": 70,
        "L8": 80,
    }

    climber = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ascents")
    boulder = models.ForeignKey(Boulder, on_delete=models.CASCADE, related_name="ascents")
    ascent_type = models.CharField(max_length=20, choices=ASCENT_TYPES)
    perceived_difficulty = models.CharField(max_length=20, choices=Boulder.DIFFICULTY_CHOICES)
    liked = models.BooleanField()
    date_climbed = models.DateField(auto_now_add=True)
    points = models.PositiveIntegerField(default=0)


    class Meta:
        unique_together = ("climber", "boulder")
    
    def calculate_points(self):
        """Calculate points based on boulder grade."""
        grade = self.boulder.setter_grade
        return self.GRADE_POINTS.get(grade, 0)
    
    def __str__(self):
        return f"{self.climber.username} - {self.boulder} ({self.ascent_type})"


class SavedBoulder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_boulders")
    boulder = models.ForeignKey(Boulder, on_delete=models.CASCADE, related_name="saved_by")
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ("user", "boulder")
        ordering = ["-saved_at"]
    
    def __str__(self):
        return f"{self.user.username} saved {self.boulder}"


class UserSettings(models.Model):
    SENDS_VISIBILITY_CHOICES = [
        ("everyone", "Everyone"),
        ("only_me", "Only Me"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="settings")
    leaderboard_opt_in = models.BooleanField(
        default=True,
        help_text="Whether the user participates in the gym leaderboard",
    )
    sends_visibility = models.CharField(
        max_length=20,
        choices=SENDS_VISIBILITY_CHOICES,
        default="everyone",
        help_text="Who can see this user's sends in the activity feed",
    )

    def __str__(self):
        return f"Settings for {self.user.username}"