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

const users = {
  abcdefgh: { id: "abcdefgh", email: "a@b.ca", password: "123" },
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
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("user_registration", templateVars);
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
  let username = req.body.username;
  res.cookie("username", username, { maxAge: 900000 });
  res.redirect("/urls");
});
app.post("/register", (req, res) => {
  const userRandomId = generateRandomString(8);
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  for (const user in users) {
    if (users[user].email === userEmail) {
      res.redirect("/");
      return;
    }
  }
  users[userRandomId] = {
    id: userRandomId,
    email: userEmail,
    password: userPassword,
  };
  res.cookie("user_id", userRandomId, { maxAge: 900000 });
  // console.log(users);
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
