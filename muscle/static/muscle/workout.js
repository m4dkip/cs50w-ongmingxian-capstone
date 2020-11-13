document.addEventListener('DOMContentLoaded', function() {
    // Display edit buttons if user is author of this workout
    username = JSON.parse(document.getElementById('username').textContent);
    author = JSON.parse(document.getElementById('author').textContent);
    if (username === author)
        document.querySelectorAll(".auth").forEach(e => e.style.display = 'inline-block');
    var workout_id = document.getElementById('workout-title').dataset.id;
    var actions = `
    <a class="add" title="Add" data-toggle="tooltip"><i class="material-icons">&#xE03B;</i></a>
    <a class="edit" title="Edit" data-toggle="tooltip"><i class="material-icons">&#xE254;</i></a>
    <a class="delete" title="Delete" data-toggle="tooltip"><i class="material-icons">&#xE872;</i></a>
    `;

	// Append table with add row form on add new button click
    document.getElementById("add-new").addEventListener('click', (click) => {
        click.target.disabled = true;
        var index = document.querySelector("table").rows.length - 2;
        var row = '<tr>' +
            '<td>' + (index + 2) + '</td>' +
            '<td><input type="text" class="form-control" name="name" id="name"></td>' +
            '<td><input type="number" class="form-control" name="sets" id="sets"></td>' +
            '<td><input type="number" class="form-control" name="reps" id="reps"></td>' +
            '<td><input type="number" class="form-control" name="set_time" id="set_time"></td>' +
            '<td><input type="number" class="form-control" name="rest_time" id="rest_time"></td>' +
			'<td>' + actions + '</td>' +
        '</tr>';

    	document.querySelector("table tbody").innerHTML += row;		
        document.querySelectorAll("table tbody tr td .add")[index + 1].style.display = 'inline-block';
        document.querySelectorAll("table tbody tr td .edit")[index + 1].style.display = 'none';
    });

    // Add row on add button click
    document.querySelector(".table").addEventListener('click', function(e) {
        if(e.target && e.target.parentNode.className == "add") {
            var table = document.querySelector("table tbody");
            var row = e.target.parentNode.parentNode.parentNode;
            var index = Array.from(table.children).indexOf(row);

            var empty = false;
            // Check if all fields have been filled
            document.querySelectorAll('table tbody tr td input').forEach(input => {
                if (input.value == "") {
                    input.classList.add("error");
                    empty = true;
                } else {
                    input.classList.remove("error");
                }
            });
            if (!empty) {
                var data = [];
                document.querySelectorAll('table tbody tr td input').forEach(input => {
                    data.push(input.value);
                    input.parentNode.innerHTML = input.value;
                });
                document.querySelectorAll("table tbody tr td .add")[index].style.display = 'none';
                document.querySelectorAll("table tbody tr td .edit")[index].style.display = 'inline-block';
                document.getElementById("add-new").disabled = false;
                // Call add API
                add_exercise(workout_id, data[0], data[1], data[2], data[3], data[4], index + 1);
            }
        }
    });

    // Edit row on edit button click
    document.querySelector(".table").addEventListener('click', function(e) {
        if(e.target && e.target.parentNode.className == "edit") {
            var table = document.querySelector("table tbody");
            var row = e.target.parentNode.parentNode.parentNode;
            var index = Array.from(table.children).indexOf(row);
            var cells = Array.from(row.children);
            cells[1].innerHTML = '<input type="text" class="form-control" value="' + cells[1].innerHTML + '">';
            for (var i = 2; i < cells.length - 1; i++) {
                cells[i].innerHTML = '<input type="number" class="form-control" value="' + cells[i].innerHTML + '">';
            }
            document.querySelectorAll("table tbody tr td .add")[index].style.display = 'inline-block';
            document.querySelectorAll("table tbody tr td .edit")[index].style.display = 'none';
        }
    });

    // Delete row on delete button click
    document.querySelector(".table").addEventListener('click', function(e) {
        if(e.target && e.target.parentNode.className == "delete") {
            var table = document.querySelector("table tbody");
            var table_array = Array.from(table.children);
            var row = e.target.parentNode.parentNode.parentNode;
            var index = table_array.indexOf(row);

            // Bubble up all sequence numbers
            for (var i = index + 1; i < table_array.length; i++){
                Array.from(table_array[i].children)[0].innerHTML = i;
            }

            // Remove row HTML
            row.parentNode.removeChild(row);

            // Call delete API
            delete_exercise(workout_id, index + 1);
        }
    });
});

function add_exercise(workout_id, name, sets, reps, set_time, rest_time, sequence) {
        fetch('/create_exercise', {
        method: 'POST',
        body: JSON.stringify({
            workout_id: workout_id,
            name: name,
            sets: sets,
            reps: reps,
            set_time: set_time,
            rest_time: rest_time,
            sequence: sequence
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
      });
}

function delete_exercise(workout_id, sequence) {
    fetch('/delete_exercise', {
        method: 'POST',
        body: JSON.stringify({
            workout_id: workout_id,
            sequence: sequence
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
      });
    
}