const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
//
// Middleware
//
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }), cookieParser());

//
// Database
//
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  google: "http://www.google.com",
};

//
// Functions
//
const generateRandomString = (length) => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, length);
};

//
// ROUTES
//
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});
app.get("/", (req, res) => {
  res.send("Hello!"); // will probably put better content here
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (!urlDatabase[shortURL]) {
    return res.send("No redirect exists for this Tiny URL");
  }
  res.redirect(301, longURL);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// }); // can probably delete this at some point...

//
// CREATE
//
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(302, "/urls/" + shortURL);
});
app.post("/login", (req, res) => {
  let cookieID = generateRandomString(8);
  let username = req.body.username;
  res.cookie("username", username, { maxAge: 900000 });
  res.redirect("/urls");
});


//
// UPDATE
//
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(302, "/urls/" + shortURL);
});

//
// DELETE
//
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//
// Run Server
//
app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
