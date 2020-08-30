var tasks = {};
//var used to define an object in JS the first time it is referenced in the script. 
//createTask = function is a function that will execute the instructions inside the curly brace. 
//(taskText, taskDate, task list) everything inside the parenthesis of a function are the values that will pass into the function.
var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");

  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);
  
  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

//Load all the task arrays from local storage
// var is used to create a variable assigned to an anonymous function in my script the first time it is referenced
var loadTasks = function() {
  //get the tasks data out of local storage and parse it then put it in the tasks array 
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) { //if tasks is  equal to NULL or undefined (if tasks === null) THEN Do the following:
    tasks = { // update the tasks object with the followinig details
      toDo: [], // this creates an empty array called "toDo" inside my tasks object
      inProgress: [], // this creates an empty array called "inProgress" inside my tasks object
      inReview: [], // this creates an empty array called "inReview" inside my tasks object
      done: [], // this creates an empty array called "done" inside my tasks object
      animal: "cat"
    };
  }
  // loop over object properties
  $.each(tasks, function(list, arr) { //$.each( obj, function( key, value ) take the tasks oobject & run an annonymous function 
    // then loop over sub-array
    arr.forEach(function(task) { // for each array in the values of my object execute an
      createTask(task.text, task.date, list); //execute the create task function and push deconstruct to the text, date, and list attributes of the task
    });
  });
};  

var saveTasks = function() {
  //localStorage.setItem tells teh script to put somethiing in local storage
  //("tasks") is telling the scriipt to name the data that it grabs "tasks"
  //JSON.stringify(tasks)tells the script to take the object we defined in the var at line 1 and turn everything in that object into one long string. 
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

$(".list-group").on("blur", "textarea", function() {
  // get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var li = $(this)
  .closest(".list-group-item")

  var index = $(this)
    .closest(".list-group-item")
    .index(li);

  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
  

});

// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this).text().trim();

  // create new input element
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  });

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
  var date = $(this).val();

  var status = $(this).closest(".list-group").attr("id").replace("list-", "");
  var index = $(this).closest(".list-group-item").index();

  tasks[status][index].date = date;
  saveTasks();

  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
  $(this).replaceWith(taskSpan);

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
//("#remove-tasks") is referencing an id in the HTML file
//.on("click",) is a listener watching for the element with that ID in the HTML file or DOM to be clicked. 
//function() is an anonymous function - everything after the curly brace iis what the function does 
$("#remove-tasks").on("click", function() {
  //for is used to set a requiriement kind of like an "if/then" statement so 
  //IF the criteria defined in the parenthesis is hit THEN do whatever is in the curly braces
  //var key written inside the parenthesis is creating a var and passing iit into the for loop
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),//
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },

  update: function(event) {
    console.log("update called");
    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();

    console.log(tempArr);

  }

});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

$("#modalDueDate").datepicker({
  minDate: 1
});

var auditTask = function(taskEl) {
   // get date from task element
   var date = $(taskEl).find("span").text().trim();

   // convert to moment object at 5:00pm
   var time = moment(date, "L").set("hour", 17);
 
   // remove any old classes from element
   $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
 
   // apply new class if task is near/over due date
   if (moment().isAfter(time)) {
     $(taskEl).addClass("list-group-item-danger");
   }
   // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } 
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

// load tasks for the first time
loadTasks();


