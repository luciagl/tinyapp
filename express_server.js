const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   }
};

const generateRandomString = function() {
  return 'xxxxxx'.replace(/[x]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const lookUpByEmail = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

const urlsForUser = function(id) {
  let urls = {};
  for (let shortUrl in urlDatabase) {
    let url = urlDatabase[shortUrl];
    if (url.userID === id) {
      urls[shortUrl] = url;
    }
  }
  return urls;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    let templateVars = {
      error: "Please, login or register first."
    };

    res.render('error', templateVars);
    return;
  }

  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect('/login');
    return;
  }
  
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]) {
    const templateVars = {
      error: "Please, log in or register."
    };
    res.render('error', templateVars);
    return;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:s  hortURL", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls/' + req.params.shortURL);
});

app.post("/login", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let user = lookUpByEmail(req.body.email);
  if (user && user.password === req.body.password) {
    res.cookie("user_id", user.id);
    res.redirect('/urls');
  } else {
    res.statusCode = 403;
    res.send("No such user or incorrect password!");
  }
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect('/urls');
    return;
  }

  res.render("login");
});

app.get("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.statusCode = 403;
    res.send("Access denied!");
    return;
  }

  console.log(req.body);  // Log the POST request body to the console
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  res.redirect('/urls/' + shortUrl);
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect('/urls');
    return;
  }

  res.render("registration");
});

app.post("/register", (req, res) => {
  if ((req.body.email === '') && (req.body.password === '')) {
    res.statusCode = 400;
    res.send("Email or password is empty!");
    return;
  }
  
  if (lookUpByEmail(req.body.email)) {
    res.statusCode = 400;
    res.send("Email already registered!");
    return;
  }

  let id = generateRandomString();
  let user = {
    id: id,
    email: req.body.email,
    password: req.body.password
  };
  users[id] = user;
  res.cookie("user_id", id);
  console.log(users);
  res.redirect("/urls");
});
  
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    const templateVars = {
      error: "URL not found!"
    };
    res.render('error', templateVars);
    return;
  }

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.cookies['user_id']) {
    let templateVars = {
      error: "Please, log in or register."
    };
    res.render('error', templateVars);
    return;
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});