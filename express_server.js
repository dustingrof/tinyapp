/* eslint-disable camelcase */
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
//
// Helper Functions
//
const {
  getUser,
  getUserUrls,
  generateRandomString,
  emailLookUp,
} = require("./helpers");

//
// Middleware
//
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

app.use(
  cookieSession({
    name: "session",
    keys: [
      "C&F)J@Nc",
      "9y$B&E)H",
      "s6v9y/B?",
      "Xp2s5v8y",
      "fUjXn2r5",
      "McQfTjWn",
      "(H+MbQeT",
      "A?D(G+Kb",
      "8x!A%D*G",
      "r4u7w!z%",
    ],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

//
// Database
//
const urlDatabase = {
  lhlabs: { longURL: "http://www.lighthouselabs.ca", userID: "abcdefgh" },
  google: { longURL: "http://www.google.com", userID: "abcdefgh" },
  helloo: { longURL: "http://www.helloworld.com", userID: "abcdefu" },
};

const users = {
  abcdefgh: {
    user_id: "abcdefgh",
    email: "a@b.ca",
    password: bcrypt.hashSync("123"),
  },
  abcdefu: {
    user_id: "abcdefu",
    email: "b@c.ca",
    password: bcrypt.hashSync("123"),
  },
};

//
// ROUTES
//
app.get("/urls/new", (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
  }
  const userObject = users[req.session.user];
  const templateVars = {
    userObject,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
    return;
  }
  const user_id = req.session.user;
  const userObject = users[user_id];
  const userUrls = getUserUrls(user_id, urlDatabase);
  const templateVars = { urls: userUrls, userObject };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const userObject = users[req.session.user];
  const templateVars = { urls: urlDatabase, userObject };
  res.render("user_registration", templateVars);
});

app.get("/login", (req, res) => {
  const userObject = users[req.session.user];
  const templateVars = { urls: urlDatabase, userObject };
  res.render("user_login", templateVars);
});

app.get("/", (req, res) => {
  const userObject = users[req.session.user];
  const templateVars = { urls: urlDatabase, userObject };
  res.render("index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).render("404");
    return;
  }
  if (req.session.user !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).render("403");
    return;
  }
  const userObject = users[req.session.user];
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[shortURL].longURL,
    userObject,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.send("No redirect exists for this Tiny URL");
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// }); // can probably delete this at some point...

//
// CREATE
//
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user, // had this as res.cookies("user_id") before session existed
  };
  urlDatabase[shortURL].userID = req.session.user;
  res.redirect("/urls/" + shortURL);
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const emailExists = emailLookUp(userEmail, users);
  if (!emailExists) {
    return res.status(403).send("incorrect email");
  }
  const userFound = getUser(userEmail, users);
  // console.log("passwordFound", userFound);
  if (
    userFound.password &&
    !bcrypt.compareSync(userPassword, userFound.password)
  ) {
    return res.status(403).send("password doesnt match");
  }
  // res.cookie("user_id", userFound.user_id, { maxAge: 900000 });
  req.session.user = userFound.user_id;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  // console.log("userEmail", userEmail);
  const userPassword = bcrypt.hashSync(req.body.password);
  // console.log("userPassword", userPassword);
  const emailExists = emailLookUp(userEmail, users);
  // console.log("emailExists", emailExists);
  if (!userEmail || !userPassword || emailExists) {
    res
      .status(400)
      .send(
        "either, you have an account already or you left one of the required fields empty"
      );
    return;
  }
  const userRandomId = generateRandomString(8);
  users[userRandomId] = {
    user_id: userRandomId,
    email: userEmail,
    password: userPassword,
  };
  // res.cookie("user_id", userRandomId, { maxAge: 900000 });
  req.session.user = users[userRandomId].user_id;
  // console.log(users);
  res.redirect("/urls");
});

//
// UPDATE
//
app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.session.user !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).render("403");
    return;
  }
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls/" + shortURL);
});

//
// DELETE
//
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).render("403");
    return;
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//
// Run Server
//
app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
