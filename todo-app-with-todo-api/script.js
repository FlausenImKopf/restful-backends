//declaration of variables and initial state
const textInput = document.getElementById("text-input");
const addTodoForm = document.getElementById("add-todo-form");
const rmbtn = document.getElementById("remove-btn");
const ul = document.querySelector("ul");
const div = document.querySelector("div");

//filter state: all (default), open, done
const open = document.getElementById("open");
const done = document.getElementById("done");
const all = document.getElementById("all");

// radio button labels for styling
const openLabel = document.getElementById("open-label");
const doneLabel = document.getElementById("done-label");
const allLabel = document.getElementById("all-label");

//block continuous load spinner
const loadContainer = document.getElementById("cssload-load");
const loadBlocks = document.querySelectorAll("#cssload-block");
const submitBtn = document.getElementById("submit-btn");

// state
let state = {
  todos: [],
  filter: "all",
};

function refresh() {
  // async
  // GET Request
  fetch("http://localhost:4730/todos")
    .then((response) => {
      // continuations
      console.log("response", response);
      return response.json();
    })
    .then((data) => {
      // continuations
      console.log("data", data);

      state.todos = data;
      render();
    });
}

//take user input and add it to the state, if it's not a duplicate
function addToState() {
  //start load blocks
  loadContainer.classList.add("cssload-load");
  loadBlocks.forEach((block) => {
    block.classList.add("cssload-block");
  });
  submitBtn.style.visibility = "hidden";

  let description = textInput.value.trim();
  console.log(description);
  if (
    state.todos.some((todo) => {
      return todo.description.toLowerCase() == description.toLowerCase();
    })
  ) {
    alert("Todo already exists");
    textInput.value = "";
    return;
  }

  const newTodo = {
    description: description,
    done: false,
  };

  fetch("http://localhost:4730/todos", {
    method: "POST",
    body: JSON.stringify(newTodo),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      // continuations
      console.log("response", response);
      return response.json();
    })
    .then((data) => {
      // continuations
      console.log("data", data);

      //   state.todos = data;
      //   render();
      refresh();
      textInput.value = "";
    });
}

//remove todos from api and state
function removeCompletedTodos() {
  state.todos.forEach((todo) => {
    if (todo.done) {
      let delTodo = `http://localhost:4730/todos/${todo.id}`;
      console.log(delTodo);
      fetch(delTodo, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          refresh();
        });
    }
  });
}

function render() {
  //fake some loading time then disable load blocks and make add button visible again
  setTimeout(function () {
    loadContainer.classList.remove("cssload-load");
    loadBlocks.forEach((block) => {
      block.classList.remove("cssload-block");
    });
    // submitBtn.textContent = "add";
    submitBtn.style.visibility = "visible";
  }, 10000);

  ul.innerHTML = "";

  const todoListCls = ["todo-list-all", "todo-list-open", "todo-list-done"];

  let filterFunction;
  if (state.filter == "open") {
    open.setAttribute("checked", "");
    div.classList.remove(...todoListCls);
    div.classList.add("todo-list-open");
    addTodoForm.classList.remove("add-todo-form-done");
    addTodoForm.classList.add("add-todo-form");
    doneLabel.classList.remove("done-chosen");
    allLabel.classList.remove("all-chosen");
    openLabel.classList.add("open-chosen");
    console.log(open);
    filterFunction = (todo) => !todo.done;
  } else if (state.filter == "done") {
    done.setAttribute("checked", "");
    div.classList.remove(...todoListCls);
    div.classList.add("todo-list-done");
    addTodoForm.classList.remove("add-todo-form");
    addTodoForm.classList.add("add-todo-form-done");
    allLabel.classList.remove("all-chosen");
    openLabel.classList.remove("open-chosen");
    doneLabel.classList.add("done-chosen");
    filterFunction = (todo) => todo.done;
  } else {
    all.setAttribute("checked", "");
    filterFunction = () => true;
    div.classList.remove(...todoListCls);
    div.classList.add("todo-list-all");
    addTodoForm.classList.remove("add-todo-form-done");
    doneLabel.classList.remove("done-chosen");
    openLabel.classList.remove("open-chosen");
    allLabel.classList.add("all-chosen");
    addTodoForm.classList.add("add-todo-form");
  }

  state.todos?.filter(filterFunction).forEach((todo) => {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "done";
    input.checked = todo.done;

    input.addEventListener("change", () => {
      todo.done = input.checked;

      fetch(`http://localhost:4730/todos/${todo.id}`, {
        method: "PATCH",
        body: JSON.stringify({ done: todo.done }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          // continuations
          console.log("patch-response", response);
          return response.json();
        })
        .then((data) => {
          // continuations
          console.log("data", data);
          data.done = todo.done;
          //   render();
          refresh();
        });
    });
    const s = document.createElement("s");
    const span = document.createElement("span");

    if (todo.done) {
      s.textContent = todo.description;
      span.append(s);
    } else if (!todo.done) {
      span.textContent = todo.description;
    }

    const label = document.createElement("label");
    label.className = "each-todo";
    label.append(input, span);

    const form = document.createElement("form");
    form.append(label);

    const li = document.createElement("li");
    li.append(form);

    ul.append(li);
  });
}

//code that is executed when todo app loads
refresh();
render();

//event handling
addTodoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addToState();
  render();
});

rmbtn.addEventListener("click", () => {
  removeCompletedTodos();
});

document.addEventListener("change", () => {
  if (open.checked) {
    state.filter = "open";
  } else if (done.checked) {
    state.filter = "done";
  } else {
    state.filter = "all";
  }

  render();
});
