// create the object and array data store for the task data
/*

	ToDoListData = {
	    "University": [
	        { task: "Task 1", completed: false },
	        { task: "Task 2", completed: true }
	    ],
	    "Talent 100": [
	        { task: "Task 1", completed: false }
	    ]
	};

*/



/*


Saving data Section


*/

// load data when starting up the application 
loadFromLocalStorage();

// save data function 
function saveToLocalStorage() {
	localStorage.setItem("ToDoListData", JSON.stringify(ToDoListData));
}


// load data function 
function loadFromLocalStorage() {
	const data = localStorage.getItem("ToDoListData");
	if (data) {
		ToDoListData = JSON.parse(data);
		rebuildUI(ToDoListData);
	}
	else {
		ToDoListData = {};
	}
}


/*


Obtaining data and rendering UI Elements based on data


*/


function rebuildUI(data) {
	var i = 0
	for (const listTitle in data) {
        addNewTaskList(listTitle); // Create the list UI
        const taskList = data[listTitle];
        const inputElement = document.getElementsByClassName('groupTitle');
        const groupElement = inputElement[i].parentElement.nextSibling;
        const progressBarElement = groupElement.getElementsByClassName('progressBar')[0];
        const ulElement = groupElement.querySelector(".taskList");

        // Add tasks to the list
        taskList.forEach((task) => {
            const li = document.createElement("li");
            li.className = "task";
            li.textContent = task.task;
            li.setAttribute("draggable", true);

            // check if task has been checked off
            if (task.completed === true) {
            	li.classList.toggle('checked');
            }

            // Add the event listener to toggle the checked state
	        li.addEventListener('click', function () {
	            li.classList.toggle('checked');
	            toggleTaskCompletion(listTitle, task.task);
	            adjustProgressBar(progressBarElement, listTitle);
	            saveToLocalStorage();
	        });

            // Add delete button to the task
            const span = document.createElement("SPAN");
            span.className = "closeBtn";
            span.textContent = "\u00D7";
            span.addEventListener("click", function () {
                li.remove();
                ToDoListData[listTitle] = ToDoListData[listTitle].filter((t) => t !== task);
                adjustProgressBar(progressBarElement, listTitle);
                saveToLocalStorage();
            });

            // add event listener to drag and drop individual tasks
	        let draggedItem = null;
	        ulElement.addEventListener("dragstart", (e) => {
		        draggedItem = e.target;
		        setTimeout(() => {
		            e.target.style.display =
		                "none";
		        }, 0);
			});

			ulElement.addEventListener("dragend", (e) => {
		        setTimeout(() => {
		            e.target.style.display = "";
		            draggedItem = null;
		            updateTaskOrder(listTitle, ulElement);
		        }, 0);
			});

			ulElement.addEventListener("dragover", (e) => {
		        e.preventDefault();
		        const afterElement =
		            getDragAfterElement(
		                ulElement,
		                e.clientY);
		        const currentElement =
		            document.querySelector(
		                ".dragging");
		        if (afterElement == null) {
		            ulElement.appendChild(
		                draggedItem
		            );} 
		        else {
		            ulElement.insertBefore(
		                draggedItem,
		                afterElement
		        );}
		    });

			const getDragAfterElement = (container, y) => {
			    const draggableElements = [
			        ...container.querySelectorAll(
			            "li:not(.dragging)"
			        ),];

			    return draggableElements.reduce(
			        (closest, child) => {
			            const box =
			                child.getBoundingClientRect();
			            const offset =
			                y - box.top - box.height / 2;
			            if (
			                offset < 0 &&
			                offset > closest.offset) {
			                return {
			                    offset: offset,
			                    element: child,
			                };} 
			            else {
			                return closest;
			            }},
			        {
			            offset: Number.NEGATIVE_INFINITY,
			        }
			    ).element;
			};

            li.appendChild(span);
            ulElement.appendChild(li);
        });

        adjustProgressBar(progressBarElement, listTitle);

        i++;
    }
}



/*


To Do UI Section 



*/



// New To Do List Button
var newToDoListInput = document.getElementById("createNewTaskListInput");
newToDoListInput.addEventListener('keypress', function (e){
	if (e.key === 'Enter') {
		if (newToDoListInput.value === '') {
			alert("Please input a title for your new To Do List!");
		}
		else {
			// first check if to do list exists already
			for (let taskList in ToDoListData) {
				if (newToDoListInput.value === taskList) {
					alert("To Do List already exists!");
					newToDoListInput.value = ''
					return;
				}
			}

			// Add new task
			newToDoListInput.blur();
			addNewTaskList(newToDoListInput.value);

			// Create new list and store it in ToDoListData object
			ToDoListData[newToDoListInput.value] = [];
			console.log(ToDoListData);
			saveToLocalStorage();

			// reset the input value
			newToDoListInput.value = '';
		}
	}
})


// Add new To Do List Groups 
function addNewTaskList(newToDoListInputValue) {
    // Create the group task header and input
    var groupTasksList = document.getElementById("groupTasksList");
    var groupTask = document.createElement("LI");
    var groupTitle = document.createElement("INPUT");
    groupTask.className = "groupTasks";
    groupTitle.className = "groupTitle";
    groupTitle.value = newToDoListInputValue;

    // Keep track of the current name of the to-do list
    let currentGroupTitle = newToDoListInputValue;

    groupTitle.setAttribute("readonly", true);
    groupTask.appendChild(groupTitle);
    groupTasksList.appendChild(groupTask);

    // Make group title editable on double click
    groupTitle.addEventListener("dblclick", () => {
        groupTitle.removeAttribute("readonly");
        groupTitle.focus();
    });

    groupTitle.addEventListener("blur", () => {
        groupTitle.setAttribute("readonly", true);

        // Update the key for the to-do list if the name changes
        if (groupTitle.value !== currentGroupTitle) {
            ToDoListData[groupTitle.value] = ToDoListData[currentGroupTitle];
            delete ToDoListData[currentGroupTitle];
            currentGroupTitle = groupTitle.value;
            console.log(ToDoListData);
            saveToLocalStorage();
        }
    });

    groupTitle.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            groupTitle.setAttribute("readonly", true);
            groupTitle.blur();

            // Update the key for the to-do list if the name changes
            if (groupTitle.value !== currentGroupTitle) {
                ToDoListData[groupTitle.value] = ToDoListData[currentGroupTitle];
                delete ToDoListData[currentGroupTitle];
                currentGroupTitle = groupTitle.value;
                console.log(ToDoListData);
                saveToLocalStorage();
            }
        }
    });

    // Create the collapsible task list (input area)
    var collapsibleTaskList = document.createElement("DIV");
    collapsibleTaskList.className = "collapsibleTaskList";
    var taskInputDiv = document.createElement("DIV");
    taskInputDiv.className = "taskInputDiv";
    var taskInput = document.createElement("INPUT");
    taskInput.placeholder = "Add new task";

    // Create the progress bar 
    var progressBarBorder = document.createElement("DIV");
    progressBarBorder.className = "progressBarBorder";
    var progressBar = document.createElement("DIV");
    progressBar.className = "progressBar";
    var progressBarText = document.createTextNode("0%");
    progressBar.appendChild(progressBarText);
    progressBarBorder.appendChild(progressBar);
    taskInputDiv.appendChild(progressBarBorder);

    // Now create the unordered list where the new tasks will be listed
    var taskList = document.createElement("UL");
    taskList.className = "taskList";

    taskInput.className = "taskInput";
    taskInputDiv.appendChild(taskInput);
    collapsibleTaskList.appendChild(taskInputDiv);
    collapsibleTaskList.appendChild(taskList);
    groupTasksList.appendChild(collapsibleTaskList);

    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
        	if (!checkTaskExists(currentGroupTitle, taskInput)) {
        		addNewTask(taskInput, taskList, collapsibleTaskList, currentGroupTitle, progressBar);
        	}   	
        }
    });

    // Add collapsible buttons
    var span1 = document.createElement("SPAN");
    //var arrow = document.createTextNode("🡇");
    span1.className = "expandTaskGroupBtn";
    //span1.appendChild(arrow);
    groupTask.appendChild(span1);

    // Add the collapsible event for the collapsible button
    span1.addEventListener("click", function () {
        var taskList = collapsibleTaskList;
        this.classList.toggle("active");
        if (taskList.style.maxHeight) {
            taskList.style.maxHeight = null;
            taskList.style.padding = "0px";
        } else {
            taskList.style.maxHeight = taskList.scrollHeight + "px";
            taskList.style.padding = "15px";
        }
    });

    // Add delete button
    var span2 = document.createElement("SPAN");
    var bin = document.createTextNode("🗑");
    span2.className = "deleteTaskGroupBtn";
    span2.appendChild(bin);
    groupTask.appendChild(span2);

    span2.onclick = function () {
        // Delete the list from the data
        delete ToDoListData[currentGroupTitle];
        console.log(ToDoListData);
        saveToLocalStorage();

        // Hide element from list
        var div = this.parentElement;
        collapsibleTaskList.remove();
        div.remove();
    };
}

function checkTaskExists(currentGroupTitle, taskInput) {
	for  (var i = 0; i < ToDoListData[currentGroupTitle].length; i++) {
		if (ToDoListData[currentGroupTitle][i].task === taskInput.value) {
			alert("Task already exists!");
			return true;
		}
	}
	return false;
}


function addNewTask(taskInput, taskList, collapsibleTaskList, groupTitleValue, progressBar) {
    if (taskInput.value === '') {
        alert("Please input a new task!");
    } else {
        // Add the task to the data object
        ToDoListData[groupTitleValue].push({task: taskInput.value, completed: false});
        console.log(ToDoListData);
        adjustProgressBar(progressBar, groupTitleValue);
        saveToLocalStorage();

        // Create the task element
        var li = document.createElement("li");
        li.setAttribute("draggable", true);
        li.className = "task";
        var liText = document.createTextNode(taskInput.value);
        var task = taskInput.value;
        li.appendChild(liText);
        taskList.appendChild(li);

        // Reset the input content
        taskInput.value = "";

        // Add the cross button to the task
        var span = document.createElement("SPAN");
        var cross = document.createTextNode("\u00D7");
        span.className = "closeBtn";
        span.appendChild(cross);
        li.appendChild(span);

        // add event listener to drag and drop individual tasks
        let draggedItem = null;
        taskList.addEventListener("dragstart", (e) => {
	        draggedItem = e.target;
	        setTimeout(() => {
	            e.target.style.display =
	                "none";
	        }, 0);
		});

		taskList.addEventListener("dragend", (e) => {
	        setTimeout(() => {
	            e.target.style.display = "";
	            draggedItem = null;
	            updateTaskOrder(groupTitleValue, taskList);
	        }, 0);
		});

		taskList.addEventListener("dragover", (e) => {
	        e.preventDefault();
	        const afterElement =
	            getDragAfterElement(
	                taskList,
	                e.clientY);
	        const currentElement =
	            document.querySelector(
	                ".dragging");
	        if (afterElement == null) {
	            taskList.appendChild(
	                draggedItem
	            );} 
	        else {
	            taskList.insertBefore(
	                draggedItem,
	                afterElement
	        );}
	    });

		const getDragAfterElement = (container, y) => {
		    const draggableElements = [
		        ...container.querySelectorAll(
		            "li:not(.dragging)"
		        ),];

		    return draggableElements.reduce(
		        (closest, child) => {
		            const box =
		                child.getBoundingClientRect();
		            const offset =
		                y - box.top - box.height / 2;
		            if (
		                offset < 0 &&
		                offset > closest.offset) {
		                return {
		                    offset: offset,
		                    element: child,
		                };} 
		            else {
		                return closest;
		            }},
		        {
		            offset: Number.NEGATIVE_INFINITY,
		        }
		    ).element;
		};

        // Add the event listener to toggle the checked state
        li.addEventListener('click', function () {
            li.classList.toggle('checked');
            toggleTaskCompletion(groupTitleValue, task);
            adjustProgressBar(progressBar, groupTitleValue);
            saveToLocalStorage();
        });

        // Close button functionality
        span.addEventListener('click', function () {
            // Remove the task from the data
            const taskIndex = ToDoListData[groupTitleValue].indexOf(task);
            ToDoListData[groupTitleValue] = ToDoListData[groupTitleValue].filter(taskObj => taskObj.task !== task);
            console.log(ToDoListData);
            saveToLocalStorage();

            // Remove the task from the UI
            li.remove();
            adjustProgressBar(progressBar, groupTitleValue);
            adjustCollapsibleHeight(collapsibleTaskList);
        });
        adjustCollapsibleHeight(collapsibleTaskList);
    }
}

function updateTaskOrder(groupTitle, taskList) {
	const newOrder = [];
    const tasks = taskList.querySelectorAll(".task");

    tasks.forEach((task) => {
        const taskText = task.textContent.replace("\u00D7", "").trim(); // Remove the close button symbol
        const foundTask = ToDoListData[groupTitle].find((t) => t.task === taskText);
        if (foundTask) newOrder.push(foundTask);
    });

    // Update the order in data
    ToDoListData[groupTitle] = newOrder; 
    console.log(ToDoListData);
    saveToLocalStorage();
}

function toggleTaskCompletion(groupTitle, taskName) {
    const task = ToDoListData[groupTitle].find(taskObj => taskObj.task === taskName);
    if (task) {
        task.completed = !task.completed; // Toggle the completed state
    }
    console.log(ToDoListData);
}

function adjustProgressBar(progressBar, groupTitle) {
	// specific case for no tasks
	if (ToDoListData[groupTitle].length === 0) {
		progressBar.style.width = "0%";
		progressBar.innerHTML = '0%';
		progressBar.style.backgroundColor = "red";
		return;
	}
	var completedTasks = 0;
    for (var i = 0; i < ToDoListData[groupTitle].length; i++) {
    	if (ToDoListData[groupTitle][i].completed === true) {
    		completedTasks++;
    	}
    }
    var width = Math.round((completedTasks / ToDoListData[groupTitle].length) * 100);
    progressBar.style.width = `${width}%`;
    progressBar.innerHTML = `${width}%`;

    // change colour of progress bar based on completed tasks
    if (width <= 40) {
    	progressBar.style.backgroundColor = "rgb(217, 90, 90)";
    }

    else if (width <= 79) {
    	progressBar.style.backgroundColor = "rgb(217, 153, 90)";
    }

    else if (width <= 99){
    	progressBar.style.backgroundColor = "rgb(116, 194, 92)";
    }

    else {
		progressBar.style.backgroundColor = "green";
    }
}

// Function to adjust the height of the collapsible section
function adjustCollapsibleHeight(collapsibleTaskList) {
    // Update the max-height to fit the new content
    collapsibleTaskList.style.maxHeight = collapsibleTaskList.scrollHeight + "px";
}