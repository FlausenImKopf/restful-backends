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

// state
let state = {
  todos: [],
  filter: "all",
};

//initialize backend
// fetch("http://localhost:4730/todos")
//   .then((response) => {
//     // continuations
//     console.log("response", response);
//     return response.json();
//   })
//   .then((data) => {
//     // continuations
//     console.log("data", data);

//     state.todos = data;
//     render();
//   });

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
  let description = textInput.value.trim();
  console.log(description);
  // if (
  //   state.todos.some((todo) => {
  //     return todo.description.toLowerCase() == description.toLowerCase();
  //   })
  // ) {
  //   alert("Todo already exists");
  //   return;
  // }

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
async function removeCompletedTodos() {
  state.todos.forEach((todo) => {
    if (todo.done) {
      let delTodo = `http://localhost:4730/todos/${todo.id}`;
      console.log(delTodo);
      fetch(delTodo, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {});
    }
  });
  refresh();
  render();
}

function render() {
  ul.innerHTML = "";

  const todoListCls = ["todo-list-all", "todo-list-open", "todo-list-done"];

  let filterFunction;
  if (state.filter == "open") {
    open.setAttribute("checked", "");
    div.classList.remove(...todoListCls);
    div.classList.add("todo-list-open");
    addTodoForm.classList.remove("add-todo-form-done");
    addTodoForm.classList.add("add-todo-form");
    filterFunction = (todo) => !todo.done;
  } else if (state.filter == "done") {
    done.setAttribute("checked", "");
    div.classList.remove(...todoListCls);
    div.classList.add("todo-list-done");
    addTodoForm.classList.remove("add-todo-form");
    addTodoForm.classList.add("add-todo-form-done");
    filterFunction = (todo) => todo.done;
  } else {
    all.setAttribute("checked", "");
    filterFunction = () => true;
    div.classList.remove(...todoListCls);
    div.classList.add("todo-list-all");
    addTodoForm.classList.remove("add-todo-form-done");
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
        body: JSON.stringify({ done: true }),
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
  // function setFilter() {
  //   const filterState = {
  //     filter: state.filter,
  //   };

  //   fetch("http://localhost:4730/todos", {
  //     method: "POST",
  //     body: JSON.stringify(filterState),
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((response) => {
  //       // continuations
  //       console.log("filter-response", response);
  //       return response.json();
  //     })
  //     .then((data) => {
  //       // continuations
  //       console.log("filterData", data);

  //       //   state.todos = data;
  //       //   render();
  //       refresh();
  //     });
  // }

  if (open.checked) {
    state.filter = "open";
  } else if (done.checked) {
    state.filter = "done";
  } else {
    state.filter = "all";
  }

  render();
});
