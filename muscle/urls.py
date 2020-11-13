from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("profile/<str:username>", views.profile, name="profile"),
    path("workout/<str:workout_id>", views.workout, name="workout"),
    path("workout/<str:workout_id>/play", views.play, name="play"),

    # API Routes
    path("create_exercise", views.create_exercise, name="create_exercise"),
    path("delete_exercise", views.delete_exercise, name="delete_exercise"),
]
