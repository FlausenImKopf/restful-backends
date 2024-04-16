const main = document.getElementById("main");
const btn = document.querySelector("button");

let state = {};

function getState() {
  const p = fetch("https://dummy-apis.netlify.app/api/quote");
  return p
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      state.quote = data.quote;
      state.author = data.author;
    });
}

function render() {
  getState().then(() => {
    const p1 = document.getElementById("quote");
    p1.textContent = state.quote;
    p1.className = "quote";
    const p2 = document.getElementById("author");
    p2.textContent = "-" + state.author;
    p2.className = "author";
    main.append(p1, p2);
  });
}

render();

btn.addEventListener("click", () => {
  render();
});
