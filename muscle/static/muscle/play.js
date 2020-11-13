// Timer adapted from https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/
// Credit: Mateusz Rybczonec
const FULL_DASH_ARRAY = 283;
const WORK_COLOR = "green";
const REST_COLOR = "cyan";
// const WORK_BACKGROUND_COLOR = '#d7f5d9';
// const REST_BACKGROUND_COLOR = '#d7eefc';
const WORK_BACKGROUND_COLOR = '#1aaf5d'; // dark
const REST_BACKGROUND_COLOR = '#4d59de'; // dark

let timeLimit = 0;
let timePassed = 0;
let timeLeft = timeLimit;
let timerInterval = null;
let remainingPathColor = WORK_COLOR;

document.addEventListener('DOMContentLoaded', function() {
    // Add timer graphics to HTML
    document.getElementById("app").innerHTML = `
    <div class="base-timer">
    <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g class="base-timer__circle">
        <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
        <path
            id="base-timer-path-remaining"
            stroke-dasharray="283"
            class="base-timer__path-remaining ${remainingPathColor}"
            d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
            "
        ></path>
        </g>
    </svg>
    <span id="base-timer-label" class="base-timer__label">${formatTime(
        timeLeft
    )}</span>
    </div>
    `;

    // Parse list of exercises as JSON
    exercises = JSON.parse(exercise_list.innerHTML);
    console.log(exercises);

    // Set up timer for first exercise and start timer
    startSetTimer(exercises[0].sets, exercises[0].set_time, exercises[0].rest_time);
    document.getElementById("exercise-name").innerHTML = exercises[0].name;
    document.getElementById("set-count-current").innerHTML = '1';
    document.getElementById("set-count-total").innerHTML = exercises[0].sets;
    document.getElementById("rep-count").innerHTML = exercises[0].reps;
    if (exercises.length > 1) {
        document.getElementById("next-exercise").innerHTML = exercises[1].name;
    } else {
        document.getElementById("next-exercise").innerHTML = '-';
        document.getElementById("next-button").classList.add('disabled');
    }

    // Set up Next button to play next exercise
    var i = 0;
    document.getElementById("next-button").addEventListener('click', (click) => {
        if (i + 1 < exercises.length) { // As long as this index is not the last one
            startSetTimer(exercises[i + 1].sets, exercises[i + 1].set_time, exercises[i + 1].rest_time);
            document.getElementById("exercise-name").innerHTML = exercises[i + 1].name;
            document.getElementById("set-count-current").innerHTML = '1';
            document.getElementById("set-count-total").innerHTML = exercises[i + 1].sets;
            document.getElementById("rep-count").innerHTML = exercises[i + 1].reps;
            if (i + 2 < exercises.length) {
                document.getElementById("next-exercise").innerHTML = exercises[i + 2].name;
            } else {
                document.getElementById("next-exercise").innerHTML = '-';
                click.target.classList.add('disabled');
            }
        }
        i++;
    });
});

// Function to start and play timer
function startSetTimer(sets, workoutTime, restTime) {
    resetTimer(workoutTime);
    setPathColor(WORK_COLOR);
    document.getElementById("exercise-phase").innerHTML = "START";
    document.getElementById("exercise-phase").classList.remove("blinking");

    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = timeLimit - timePassed;
        document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
        setCircleDasharray();

        if (timeLeft === 0) {
            onTimesUp();
            if (sets > 0) {
                startRestTimer(--sets, workoutTime, restTime);
            }
        }
    }, 1000);
}

function startRestTimer(sets, workoutTime, restTime) {
    resetTimer(restTime);
    setPathColor(REST_COLOR);
    document.getElementById("exercise-phase").innerHTML = "REST";
    document.getElementById("exercise-phase").classList.add("blinking");

    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = timeLimit - timePassed;
        document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
        setCircleDasharray();

        if (timeLeft === 0) {
            onTimesUp();
            if (sets > 0) { // Only start another timer when there are sets remaining
                startSetTimer(sets, workoutTime, restTime);
                document.getElementById("set-count-current").innerHTML = parseInt(document.getElementById("set-count-current").innerHTML) + 1;
            }
        }
    }, 1000);
}

function resetTimer(time) {
    timeLimit = time;
    timePassed = 0;
    timeLeft = timeLimit;
    clearInterval(timerInterval);
    timerInterval = null;

    document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
    setCircleDasharray();
}

function onTimesUp() {
    clearInterval(timerInterval);
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
}

function setPathColor(color) {
    if (color == WORK_COLOR) {
        document.getElementById("base-timer-path-remaining").classList.remove(REST_COLOR);
        document.getElementById("base-timer-path-remaining").classList.add(WORK_COLOR);
        document.body.style.backgroundColor = WORK_BACKGROUND_COLOR;
    } else if (color == REST_COLOR) {
        document.getElementById("base-timer-path-remaining").classList.remove(WORK_COLOR);
        document.getElementById("base-timer-path-remaining").classList.add(REST_COLOR);
        document.body.style.backgroundColor = REST_BACKGROUND_COLOR;
    }
}

function calculateTimeFraction() {
    const rawTimeFraction = timeLeft / timeLimit;
    return rawTimeFraction - (1 / timeLimit) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
    const circleDasharray = `${(
        calculateTimeFraction() * FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
}