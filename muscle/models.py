from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.crypto import get_random_string

class User(AbstractUser):
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "date_joined": self.date_joined
        }

class Workout(models.Model):
    code = models.CharField(max_length=5, primary_key=True)
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="author")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    
class Exercise(models.Model):
    name = models.CharField(max_length=255, default="New Exercise")
    description = models.TextField(blank=True)
    sets = models.PositiveIntegerField(default=0)
    reps = models.PositiveIntegerField(default=0)
    set_time = models.PositiveIntegerField(default=0) # In seconds btw
    rest_time = models.PositiveIntegerField(default=0) # In seconds btw
    workout = models.ForeignKey("Workout", on_delete=models.CASCADE)
    sequence = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ['workout', 'sequence']
        ordering = ['workout', 'sequence']
    
    def serialize(self):
        return {
            "name": self.name,
            "sets": self.sets,
            "reps": self.reps,
            "set_time": self.set_time,
            "rest_time": self.rest_time,
            "workout": self.workout.pk,
            "sequence": self.sequence,
        }