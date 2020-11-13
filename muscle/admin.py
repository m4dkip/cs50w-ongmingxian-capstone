from django.contrib import admin

from .models import User, Workout, Exercise

# Register your models here.
admin.site.register(User)
admin.site.register(Workout)
admin.site.register(Exercise)