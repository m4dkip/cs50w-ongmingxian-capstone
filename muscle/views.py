import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django import forms
from django.utils.crypto import get_random_string


from .models import User, Workout, Exercise

class WorkoutForm(forms.Form):
    name = forms.CharField(max_length=255)
    description = forms.CharField(widget=forms.Textarea())

def index(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))

    if request.method == "POST":
        # Add new workout
        form = WorkoutForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            description = form.cleaned_data['description']
            if name is not None:
                workout = Workout(
                    pk=get_random_string(length=5),
                    author=request.user,
                    name=name,
                    description=description
                )
                workout.save()
                return HttpResponseRedirect(reverse("workout", kwargs={'workout_id' : workout.pk}))

    form = WorkoutForm()

    # Get all workouts for current user
    if request.user.is_authenticated:
        workouts = Workout.objects.filter(author=request.user).all()
    else:
        workouts = []

    context = {
        'form': form,
        'workouts': workouts,
    }
    return render(request, "muscle/index.html", context)

def profile(request, username):
    # Query for requested User
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return render(request, "muscle/error.html", {
                "message": "User does not exist."
        })
    
    # Query for workouts made by a particular user
    workouts = Workout.objects.filter(author=user).all()

    user = user.serialize()

    context = {
        'profile_user': user,
        'workouts': workouts
    }

    return render(request, "muscle/profile.html", context)  

def workout(request, workout_id):
    # Query for requested Workout
    try:
        workout = Workout.objects.get(pk=workout_id)
    except Workout.DoesNotExist:
        return render(request, "muscle/error.html", {
                "message": "Workout does not exist."
        })

    exercises = Exercise.objects.filter(workout=workout).all()
    context = {
        'workout': workout,
        'workout_id': workout_id,
        'exercises': exercises,
    }
    
    return render(request, "muscle/workout.html", context)

def play(request, workout_id):
    workout = Workout.objects.get(pk=workout_id)
    exercise_list = Exercise.objects.filter(workout=workout).all()
    exercise_list = [exercise.serialize() for exercise in exercise_list]
    context = {
        'workout_id': workout_id,
        'exercise_list': exercise_list
    }
    return render(request, "muscle/play.html", context)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "muscle/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "muscle/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "muscle/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "muscle/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "muscle/register.html")

# ---------- API Here ----------

@csrf_exempt
@login_required
def create_exercise(request):
    # Creating a new exercuse must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)

    # Get workout object
    if data.get("workout_id") is not None:
        workout_id = data["workout_id"]
    else:
        return JsonResponse({"error": "Workout ID required."}, status=400)

    try:
        workout = Workout.objects.get(pk=workout_id)
    except Workout.DoesNotExist:
        return JsonResponse({"error": "Workout with that ID does not exist."}, status=400)

    # User must be the author of this workout
    if workout.author != request.user:
        return JsonResponse({"error": "User is not the author of this workout"}, status=400)

    # Get contents of exercise
    if data.get("name") is not None:
        name = data["name"]
    if data.get("sets") is not None:
        sets = data["sets"]
    if data.get("reps") is not None:
        reps = data["reps"]
    if data.get("set_time") is not None:
        set_time = data["set_time"]
    if data.get("rest_time") is not None:
        rest_time = data["rest_time"]
    if data.get("sequence") is not None:
        sequence = data["sequence"]

    # Check if exercise with this sequence number already exists
    try:
        exercise = Exercise.objects.get(workout=workout, sequence=sequence)
        print(exercise.name, exercise.sets, exercise.reps, exercise.set_time, exercise.rest_time)
        # Update exercise with new attributes
        exercise.name = name
        exercise.sets = sets
        exercise.reps = reps
        exercise.set_time = set_time
        exercise.rest_time = rest_time
        exercise.save()
    except Exercise.DoesNotExist:
        # Create exercise
        exercise = Exercise(
            workout=workout,
            name=name,
            sets=sets,
            reps=reps,
            set_time=set_time,
            rest_time=rest_time,
            sequence=sequence
        )
        exercise.save()
    
    return JsonResponse({"message": "Exercise submitted successfully."}, status=201)

@csrf_exempt
@login_required
def delete_exercise(request):
    # Deleting a exercuse must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)

    # Get workout object
    if data.get("workout_id") is not None:
        workout_id = data["workout_id"]
    else:
        return JsonResponse({"error": "Workout ID required."}, status=400)
    
    try:
        workout = Workout.objects.get(pk=workout_id)
    except Workout.DoesNotExist:
        return JsonResponse({"error": "Workout with that ID does not exist."}, status=400)

    # User must be the author of this workout
    if workout.author != request.user:
        return JsonResponse({"error": "User is not the author of this workout"}, status=400)

    if data.get("sequence") is not None:
        sequence = data["sequence"]
    
    exercise = Exercise.objects.get(workout=workout, sequence=sequence)
    exercise.delete()
    
    # Bubble up sequence numbers of remaining exercise objects
    flag = True
    while flag:
        try:
            sequence = sequence + 1
            exercise = Exercise.objects.get(workout=workout, sequence=sequence)
            exercise.sequence = sequence - 1
            exercise.save()
        except Exercise.DoesNotExist:
            flag = False

    return JsonResponse({"message": "Exercise deleted successfully."}, status=201)
