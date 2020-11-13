# MUSCLE Demonstration

https://www.youtube.com/watch?v=Sdzo1Wz_Z4A

# CS50W Capstone Submission

Name: Ong Ming Xian

edX username: m4dkip

Email: e0176910@u.nus.edu

## Motivation
In light of the current COVID situation, many of us are spending more time at home due to lockdowns and stay-home orders. Personally, without access to a gym,  it is getting harder to stay motivated to stay fit. Therefore, I designed this app to help myself and others streamline the process of performing my daily exercise routine.

## Features
The app, named "Muscle" (named after what I wish I had), is a fitness tracker equipped with these features:
+ Create an individual `Exercise` with parameters such as `Set` count, `Rep` count per set, the duration for the `Set Period`, and `Rest Period` between every set.
+ Collate individual `Exercises` into a module called a `Workout`. Users are able to customize `Workouts` with their own `Exercises`.
+ `Play` a `Workout`, which plays a big on-screen timer for each `Exercise` in the `Workout` in sequence.
+ `Share` a `Workout` with other users, by providing a link.

## Justification
### Distinctiveness and Complexity
This app is sufficiently distinct from the previous projects I've completed in this course `Mail`, `Network`, `Wiki`, and `Book Review Site`. Some examples in the following sections show aspects that are not present in the previous projects.

#### Animations
This app involves `animations` done in both `css` and in `javascript`. Blinking text is done with `css` (`animation` and `@keyframes`), and the circular timer animation is done in `javascript`. The timer is adapted from [this blog post](https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/) by Mateusz Rybczonek, and has been modfied to tailor the needs of the app.

The code for the `Play` feature can be found in files `muscle/templates/muscle/play.html`, `muscle/static/muscle/play.css` and `muscle/static/muscle/play.js`.

#### Choice of Primary Key
I've opted to use a randomly generated 5-character alphanumeric code to represent the primary key of the `Workout` object. This is to allow users to share their `Workout` code with other users. The alternative, which is an integer that automatically increments, would not be suitable as other users would be able to just sequentially traverse through the IDs. This is not prefereable from a security standpoint.

#### More sophisticated CRUD
CRUD operations are more robust in this project than previous ones. Editing the `Exercise` table in a `Workout` list allows users to `delete` entries if unwanted. 

Additionally, the order of exercises is maintained both in the front-end table through `javascript`, and in the database through `API calls`. This approach was chosen to allow users to continue editing their exercises without reloading the page.

The code for editing a `Workout` can be found in `muscle/templates/muscle/workout.html`, and `muscle/static/muscle/workout.js`.

## API Information
The app has 2 API routes to modify the database.
+ `/create_exercise`: Add or Edit an `Exercise` in the database, with parameters included in the `body` of the request.
+ `/delete_exercise`: Delete an `Exercise` in the database, with parameters included in the `body` of the request.

Note that both API calls require user authentication and that users may only perform these actions on `Workouts` that they are authors of.

## Special Thanks
+ The course teaching team for providing the teaching material and support needed for me to learn! The CS50W experience has been fantastic thanks to the hard work of the teaching team.
+ My mother, who inspired me to create this app by doing exercises in the living room conducted by a Facebook livestream.
