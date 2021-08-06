// check if user exists
const lookUpByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
};


module.exports = {lookUpByEmail};