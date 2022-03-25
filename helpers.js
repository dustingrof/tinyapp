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
  return;
};

// this function was supposed to be defined as urlsForUser(id)
const getUserUrls = (user_id, database) => {
  let userUrls = {};
  for (let urlKey in database) {
    if (database[urlKey].userID === user_id) {
      userUrls[urlKey] = database[urlKey];
    }
  }
  // if (userUrls === {}) return undefined;
  if (Object.keys(userUrls).length === 0 && userUrls.constructor === Object) {
    return undefined;
  }
  return userUrls;
};

const generateRandomString = (length) => {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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
