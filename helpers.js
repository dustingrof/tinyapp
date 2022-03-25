//
// Helper Functions
//
const getUser = (email, database) => {
  let userFound = {};
  for (const userKey in database) {
    if (database[userKey].email === email) {
      userFound["user_id"] = userKey;
      userFound["password"] = database[userKey].password;
      return userFound;
    }
  }
  return userFound;
};

// this function was supposed to be defined as urlsForUser(id)
const getUserUrls = (user_id, database) => {
  let userUrls = {};
  for (let urlKey in database) {
    if (database[urlKey].userID === user_id) {
      userUrls[urlKey] = database[urlKey];
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

const emailLookUp = (email, database) => {
  for (const userKey in database) {
    if (database[userKey].email === email) {
      return true;
    }
  }
  return false;
};

module.exports = { getUser, getUserUrls, generateRandomString, emailLookUp };
