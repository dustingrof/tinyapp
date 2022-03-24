/* eslint-disable camelcase */
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
// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   google: "http://www.google.com",
// };
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "abcdefgh" },
  google: { longURL: "http://www.google.com", userID: "abcdefgh" },
  helloo: { longURL: "http://www.helloworld.com", userID: "abcdefu" },
};

const users = {
  abcdefgh: { user_id: "abcdefgh", email: "a@b.ca", password: "123" },
  abcdefu: { user_id: "abcdefu", email: "b@c.ca", password: "123" },
};

//
// Helper Functions
//
const getUser = (email) => {
  let userFound = {};
  for (const userKey in users) {
    if (users[userKey].email === email) {
      userFound["user_id"] = userKey;
      userFound["password"] = users[userKey].password;
      return userFound;
    }
  }
  return userFound;
};
const getUserUrls = (user_id) => {
  let userUrls = {};
  for (let urlKey in urlDatabase) {
    if (urlDatabase[urlKey].userID === user_id) {
      userUrls[urlKey] = urlDatabase[urlKey];
    }
  }
  return userUrls;
};
const generateRandomString = (length) => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, length);
};
const emailLookUp = (email) => {
  for (const userKey in users) {
    if (users[userKey].email === email) {
      return true;
    }
  }
  return false;
};
//
// ROUTES
//
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  const userObject = users[req.cookies["user_id"]];
  const templateVars = {
    userObject,
  };
  res.render("urls_new", templateVars);
});
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const userObject = users[user_id];
  const userUrls = getUserUrls(user_id);
  const templateVars = { urls: userUrls, userObject };
  res.render("urls_index", templateVars);
});
app.get("/register", (req, res) => {
  const userObject = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, userObject };
  res.render("user_registration", templateVars);
});
app.get("/login", (req, res) => {
  const userObject = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, userObject };
  res.render("user_login", templateVars);
});
app.get("/", (req, res) => {
  res.send("Hello!"); // will probably put better content here
});
app.get("/urls/:shortURL", (req, res) => {
  const userObject = users[req.cookies["user_id"]];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userObject,
  };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
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
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies("user_id"),
  };
  urlDatabase[shortURL].userID = req.cookies("user_id");
  res.redirect(302, "/urls/" + shortURL);
});
app.post("/login", (req, res) => {
  // let user_id = req.body.user_id;
  // console.log("this is body", req.body);
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const emailExists = emailLookUp(userEmail);
  if (!emailExists) {
    res.sendStatus(403);
  }
  const userFound = getUser(userEmail);
  console.log("passwordFound", userFound);
  if (userFound.password && userFound.password !== userPassword) {
    res.sendStatus(403);
  }
  res.cookie("user_id", userFound.user_id, { maxAge: 900000 });
  res.redirect("/urls");
});
app.post("/register", (req, res) => {
  const userRandomId = generateRandomString(8);
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const emailExists = emailLookUp(userEmail);
  if (!userEmail || !userPassword || emailExists) {
    res.sendStatus(400);
    return;
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
  urlDatabase[shortURL].longURL = req.body.longURL;
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
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//
// Run Server
//
app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
