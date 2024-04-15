const main = document.getElementById("main");
const btn = document.querySelector("button");

function getQuotes() {
  const p = fetch("https://dummy-apis.netlify.app/api/quote");
  p.then((response) => {
    console.log(response.status);
    console.log(response.ok);
    return response.json();
  }).then((data) => {
    console.log(data);
    const quote = document.getElementById("quote");
    quote.textContent = data.quote;
    const author = document.getElementById("author");
    author.textContent = data.author;
    main.append(quote, author);
    // main.append(document.createTextNode(data.author));
    // main.append(document.createTextNode(data.quote));
  });
}

getQuotes();

btn.addEventListener("click", () => {
  getQuotes();
});
