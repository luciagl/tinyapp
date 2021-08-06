const { assert } = require('chai');

const { lookUpByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('lookUpByEmail', function() {
  it('should return a user with valid email', function() {
    const user = lookUpByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedOutput);
  });

  it('non-existend email', function() {
    const user = lookUpByEmail("user@exampl.com", testUsers)
    // Write your assert statement here
    assert.isUndefined(user);
  });
});
