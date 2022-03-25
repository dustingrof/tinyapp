const { assert } = require("chai");

const {
  getUser,
  getUserUrls,
  generateRandomString,
  emailLookUp,
} = require("../helpers.js");

const testUsers = {
  userRandomID: {
    user_id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    user_id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  lhlabs: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "abcdefgh",
  },
  google: {
    longURL: "http://www.google.com",
    userID: "abcdefgh",
  },
  helloo: {
    longURL: "http://www.helloworld.com",
    userID: "abcdefu",
  },
};

describe("getUser", function () {
  it("should return a user object from the database", function () {
    const user = getUser("user@example.com", testUsers);
    const expectedUserID = {
      user_id: "userRandomID",
      password: "purple-monkey-dinosaur",
    };
    // Write your assert statement here
    assert.deepEqual(user, expectedUserID);
  });

  it("should return undefined if the email address doesnt exist", function () {
    const user = getUser("user@example.commm", testUsers);
    const expectedUserID = undefined;
    // Write your assert statement here
    assert.strictEqual(user, expectedUserID);
  });
});

describe("getUserUrls", function () {
  it("should return a an object of objects with URLs associated with to user", function () {
    const user = getUserUrls("abcdefu", urlDatabase);
    const expectedUserUrls = {
      helloo: {
        longURL: "http://www.helloworld.com",
        userID: "abcdefu",
      },
    };
    // Write your assert statement here
    assert.deepEqual(user, expectedUserUrls);
  });

  it("should return undefined if the user id doesnt exist", function () {
    const user = getUserUrls("abc", urlDatabase);
    const expectedUserID = undefined;
    // Write your assert statement here
    assert.strictEqual(user, expectedUserID);
  });
});

describe("generateRandomString", function () {
  it("should return a string with length equal to the input length", function () {
    const randomString = generateRandomString(10);
    const expectedStringLength = 10;
    // Write your assert statement here
    assert.strictEqual(randomString.length, expectedStringLength);
  });
});

describe("emailLookUp", function () {
  it("should return true if the user is found in the database, false if not", function () {
    const emailExists = emailLookUp("user@example.com", testUsers);
    const expectedResult = true;
    // Write your assert statement here
    assert.strictEqual(emailExists, expectedResult);
  });
});
