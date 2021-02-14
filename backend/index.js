require('dotenv').config()
var express = require('express')
var cors = require('cors')
var app = express()
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
const jwt = require("jsonwebtoken");

app.use(express.json())
app.use(cors())
app.use(express.urlencoded())


var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/PetitionWebsite', // Connection string for your MongoDB database
  cloud: './cloud/main.js',
  appId: 'myAppId',
  masterKey: 'myMasterKey', // Keep this key secret!
  fileKey: 'optionalFileKey',
  serverURL: 'http://localhost:1337/parse' // Don't forget to change to https if needed
});

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);

app.listen(1337, function () {
  console.log('Petition Web Server is running on 1337.');
});


var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "myAppId",
      "masterKey": "myMasterKey",
      "appName": "MyApp"
    }
  ]
});
app.use('/dashboard', dashboard);

//-------------------------------------------------------------------------



// --------- SignUp ------------ 

const userSignUp = async (email, password, studentID) => {
  // TODO: other validation, studentID, email and etc
  // TODO: get user's name 
  if (password.length < 5) {
    return Promise.reject({ code: 125, message: "Length of password is less than 5 chars!" });
  }
  Parse.User.enableUnsafeCurrentUser()
  const user = new Parse.User();
  user.set("username", studentID);
  user.set("email", email);
  user.set("password", password);
  user.set("studentID", parseInt(studentID));
  try {
    await user.signUp();
    console.log("New user successfully created!")
    return "User successfully created!";
  } catch (error) {
    let messageErr = { code: error.code, message: error.message };
    return Promise.reject(messageErr);
  }
}

app.post('/signup', (req, res) => {
  var promiseOutput = userSignUp(req.body.email, req.body.password, req.body.studentID);
  promiseOutput.then(value => {
    res.status(201).send({ "message": value });
  }, reason => {
    res.status(reason.code).send(reason); // Error!
  });
})

// --------- SignIn ------------ 

const userSignIn = async (studentID, password) => {
  // TODO: Validate stdID to be in 8 digit number
  // TODO: Validate password to be a string + its length
  // TODO: Validate the request length
  Parse.User.enableUnsafeCurrentUser()
  try {
    const user = await Parse.User.logIn(studentID, password);
    console.log("User successfully signed in!");
    return user.getUsername();  // Double check is needed!
  } catch (error) {
    return Promise.reject({ code: error.code, message: error.message });
  }
}

app.post('/signin', (req, res) => {
  var promiseOutput = userSignIn(req.body.studentID, req.body.password);
  promiseOutput.then(value => {
    //const username = req.body.email;
    //const user = { name : value };
    const accessToken = jwt.sign({ name: value }, process.env.ACCESS_TOKEN_SECRET);
    console.log("Access token generated for new user: " + accessToken);
    res.json({ accessToken: accessToken });
  }, reason => {
    console.log("User can't sign in, reason: " + reason);
    let header_status = 400;
    if (reason.code !== undefined)
      header_status = reason.code;
    res.status(header_status).send(reason);
  });

})

// -------- Petition Management ---------

// NEW PETITION

const newPetition = async (title, content, author) => {
  // TODO: convert these three lines (retrieving user) to a async function.
  const query = new Parse.Query("User");
  query.equalTo("username", author);
  const user = await query.find();
  const Petition = Parse.Object.extend("Petition");
  const petition = new Petition();
  petition.set('title', title);
  petition.set('content', content);
  petition.set('createdBy', user[0]);
  petition.set('signedUsersArray', [author]);
  petition.set('signatureNum', 1);
  try {
    await petition.save();
    console.log("New petition crearted by " + author + " the id is " + petition.id);
  } catch (error) {
    console.log("Error saving new petition, error: " + error);
  }
  return petition.id;
}

app.post('/petition/new', authenticateToken, (req, res) => {
  // TODO: validation of titile and content
  let user = req.user;
  let title = req.body.title;
  let content = req.body.content;
  if (title === undefined || content == undefined) {
    res.status(400).send({ "message": "Request Length should be 2" });
    return;
  }
  if (title == '') {
    res.status(400).send({ "message": "filed `title` is not valid" });
    return;
  }
  newPetition(title, content, user).then(value => {
    //console.log(value);
    res.status(201).send({ "objectId": value });
  }, reason => {
    res.status(400).send({ "message": reason.message });
  })
})

// SIGN A PETITION

const signPetition = async (petitionId, signer) => {
  // TODO: its better for safety that you use a differetn objectID rather than using the same one existing in parseserver.
  // const query = new Parse.Query("User");
  // query.equalTo("username", signer);
  // const user = await query.find();
  // userId = user[0].id;
  // console.log(userId);
  console.log(signer);
  const Petition = Parse.Object.extend("Petition");
  const query2 = new Parse.Query(Petition);
  query2.get(petitionId)
    .then((petition) => {
      const signedArray = petition.get("signedUsersArray");
      for (const value of signedArray) {
        if (value === signer){
          return Promise.reject({ code: 125, message: "User has already signed this petition!" }); // 125 is the code number?
        }
      }
      petition.addUnique("signedUsersArray", signer);
      petition.increment("signatureNum");
      return petition.save();
    }, (error) => {
      console.log("Error occured when retrieving petition: " + error);
    });
  return 1;
}

app.post('/petition/sign', authenticateToken, (req, res) => {
  petitionId = req.body.petitionId;
  signer = req.user;
  signPetition(petitionId, signer).then(value => {
    console.log("Petition signed");
    res.status(201).send({ "OK": "ok" });
  }, reason => {
    res.status(400).send({ "message": reason.message });
  })
})





// ---------- AUTHENTICATION --------------

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    console.log("Token did not recieved correctly!")
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log("Authentication failed!")
      return res.sendStatus(403);
    }
    req.user = user["name"];
    console.log("Authenticated successfuly " + req.user);
    next();
  })

}
