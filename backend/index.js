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

app.listen(1337, function() {
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
  if(password.length < 5) {
      return Promise.reject({code:125 ,message: "Length of password is less than 5 chars!"});
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
      let messageErr = {code:error.code ,message:error.message};
      return Promise.reject(messageErr);
  }
}


app.post('/signup', (req, res) => {
  var promiseOutput = userSignUp(req.body.email, req.body.password, req.body.studentID);
  promiseOutput.then(value => {
      res.status(201).send({"message": value});
    }, reason => {
      res.status(reason.code).send(reason); // Error!
  });
})

// --------- SignIp ------------ 

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
      return Promise.reject({code:error.code ,message:error.message});
  }
}

app.post('/signin', (req,res) =>{
  var promiseOutput = userSignIn(req.body.studentID, req.body.password);
  promiseOutput.then(value => {
      //const username = req.body.email;
      //const user = { name : value };
      const accessToken = jwt.sign({ name : value }, process.env.ACCESS_TOKEN_SECRET);
      console.log("Access token generated for new user: " + accessToken);
      res.json({ accessToken : accessToken });
    }, reason => {
      console.log("User can't sign in, reason: " + reason);
      let header_status = 400;
      if (reason.code !== undefined)
        header_status = reason.code;
      res.status(header_status).send(reason);
  }); 

})





// ---------- AUTHENTICATION --------------

function authenticateToken(req, res, next){
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null){
    console.log("Token did not recieved correctly!")
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) =>{
      if (err){
        console.log("Authentication failed!")
        return res.sendStatus(403);
      }
      req.user = user;
      console.log("Authenticated successfuly")
      next(); 
  })

}
