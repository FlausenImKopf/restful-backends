//declaration of variables
const textInput = document.getElementById("text-input");
const addTodoForm = document.getElementById("add-todo-form");
const rmbtn = document.getElementById("remove-btn");
const archiveBtn = document.getElementById("archive-btn");
const ul = document.querySelector("ul");
const div = document.querySelector("div");
const errorEl = document.getElementById("error");

//filter state: all (default), open, done
const open = document.getElementById("open");
const done = document.getElementById("done");
const all = document.getElementById("all");
const archived = document.getElementById("archived");

// radio button labels for styling
const openLabel = document.getElementById("open-label");
const doneLabel = document.getElementById("done-label");
const allLabel = document.getElementById("all-label");
const archivedLabel = document.getElementById("archived-label");

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
  fetch("http://localhost:4730/todos")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      state.todos = data;
      state.error = "";
      render();
    })
    .catch(() => {
      state.error = {
        description: "Sorry, we couldn't reach the backend.",
      };
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

  const description = textInput.value.trim();
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
      return response.json();
    })
    .then((data) => {
      refresh();
      textInput.value = "";
    })
    .catch(() => {
      state.error = {
        description: "Sorry, we couldn't reach the backend.",
      };
      render();
    });
}

//remove todos from api and state
function removeCompletedTodos() {
  state.todos.forEach((todo) => {
    if (todo.done) {
      fetch(`http://localhost:4730/todos/${todo.id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          refresh();
        })
        .catch(() => {
          state.error = {
            description: "Sorry, we couldn't reach the backend.",
          };
          render();
        });
    }
  });
}

//archive todos
function archiveCompletedTodos() {
  state.todos.forEach((todo) => {
    if (todo.done) {
      todo.archived = true;
      fetch(`http://localhost:4730/todos/${todo.id}`, {
        method: "PATCH",
        body: JSON.stringify({ archived: todo.archived }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          data.archived = todo.archived;
          refresh();
        })
        .catch(() => {
          state.error = {
            description: "Sorry, we couldn't reach the backend.",
          };
          render();
        });
    }
  });
}

function render() {
  //fake some loading time then disable load blocks and make add-button visible again
  setTimeout(function () {
    loadContainer.classList.remove("cssload-load");
    loadBlocks.forEach((block) => {
      block.classList.remove("cssload-block");
    });
    // submitBtn.textContent = "add";
    submitBtn.style.visibility = "visible";
  }, 10000);

  //Tisch abräumen
  ul.innerHTML = "";
  errorEl.innerHTML = "";

  //error handling
  if (state.error) {
    errorEl.textContent = state.error.description;
    const closeButton = document.createElement("button");
    closeButton.textContent = "X";
    closeButton.addEventListener("click", () => {
      state.error = "";
      render();
    });
    errorEl.append(closeButton);
  }
  setTimeout(function () {
    errorEl.innerHTML = "";
  }, 6000);

  //styling changes depending on filter state
  const todoListCls = [
    "todo-list-all",
    "todo-list-open",
    "todo-list-done",
    "todo-list-archived",
  ];

  if (state.filter == "open") {
    open.setAttribute("checked", "");
    div.classList.remove(...todoListCls);
    div.classList.add("todo-list-open");
    addTodoForm.classList.remove("add-todo-form-done");
    addTodoForm.classList.add("add-todo-form");
    doneLabel.classList.remove("done-chosen");
    allLabel.classList.remove("all-chosen");
    archivedLabel.classList.remove("archived-chosen");
    openLabel.classList.add("open-chosen");
  } else if (state.filter == "done") {
    done.setAttribute("checked", "");
    div.classList.remove(...todoListCls);
    div.classList.add("todo-list-done");
    addTodoForm.classList.remove("add-todo-form");
    addTodoForm.classList.add("add-todo-form-done");
    allLabel.classList.remove("all-chosen");
    openLabel.classList.remove("open-chosen");
    archivedLabel.classList.remove("archived-chosen");
    doneLabel.classList.add("done-chosen");
  } else if (state.filter == "all") {
    all.setAttribute("checked", "");
    div.classList.remove(...todoListCls);
    div.classList.add("todo-list-all");
    addTodoForm.classList.remove("add-todo-form-done");
    doneLabel.classList.remove("done-chosen");
    openLabel.classList.remove("open-chosen");
    archivedLabel.classList.remove("archived-chosen");
    allLabel.classList.add("all-chosen");
    addTodoForm.classList.add("add-todo-form");
  } else {
    archived.setAttribute("checked", "");
    div.classList.remove(...todoListCls);
    div.classList.add("todo-list-archived");
    doneLabel.classList.remove("done-chosen");
    openLabel.classList.remove("open-chosen");
    allLabel.classList.remove("all-chosen");
    archivedLabel.classList.add("archived-chosen");
    addTodoForm.classList.remove("add-todo-form");
    addTodoForm.classList.add("add-todo-form-done");
  }

  const filterFunction =
    state.filter == "open"
      ? (todo) => !todo.done && !todo.archived
      : state.filter == "done"
      ? (todo) => todo.done && !todo.archived
      : state.filter == "all"
      ? (todo) => !todo.archived
      : (todo) => todo.archived;

  //the actual rendering depending on selected filter
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
          return response.json();
        })
        .then((data) => {
          data.done = todo.done;
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
});

rmbtn.addEventListener("click", () => {
  removeCompletedTodos();
});

archiveBtn.addEventListener("click", () => {
  archiveCompletedTodos();
});

document.addEventListener("change", () => {
  open.checked
    ? (state.filter = "open")
    : done.checked
    ? (state.filter = "done")
    : all.checked
    ? (state.filter = "all")
    : (state.filter = "archived");

  render();
});
