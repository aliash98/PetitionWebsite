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
  //student id validation
  let studentID = req.body.studentID;
  let email = req.body.email;
  let password = req.body.password;
  const myregex = /^\d{8}$/;
  if (!myregex.test(studentID)){
    res.status(400).send({ "message": "StudentId is not a number!" });
    console.log("StudentId is not a number!");
    return;
  }
  var promiseOutput = userSignUp(email, password, studentID);
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
  let studentID = req.body.studentID;
  const myregex = /^\d{8}$/;
  if (!myregex.test(studentID)) {
    res.status(400).send({"message": "StudentId is not a number!"});
    console.log("StudentId is not a number!");
    return;
  }
  var promiseOutput = userSignIn(studentID, req.body.password);
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

const newPetition = async (title, content, author, category, dueDate) => {
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
  if (dueDate !== undefined)
    petition.set('dueDate', dueDate);
  if (category !== undefined)
    petition.set('category', category);
  const now = new Date();
  petition.set('signatureDates', [now]);
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
  // TODO: validation of category and due date
  let user = req.user;
  let title = req.body.title;
  let content = req.body.content;
  let category = req.body.category;
  let dueDate = { "__type": "Date", "iso": req.body.dueDate };
  console.log(dueDate);
  if (category.length < 1) {
    res.status(400).send({ "message": "Category must be declared" });
    return;
  }
  if (title === undefined || content == undefined) {
    res.status(400).send({ "message": "Request Length should be 2" });
    return;
  }
  if (title == '') {
    res.status(400).send({ "message": "fieled `title` is not valid" });
    return;
  }
  newPetition(title, content, user, category, dueDate).then(value => {
    res.status(201).send({ "objectId": value });
  }, reason => {
    res.status(400).send({ "message": reason.message });
  })
})


// SIGN A PETITION

const signPetition = async (petitionId, signer) => {
  // TODO: its better for safety that you use a differetn objectID rather than using the same one existing in parseserver.
  var flag = 0;
  const Petition = Parse.Object.extend("Petition");
  const query = new Parse.Query(Petition);
  await query.get(petitionId)
    .then((petition) => {
      const signedArray = petition.get("signedUsersArray");
      for (const value of signedArray) {
        if (value === signer)
          flag = 1;
      }
      let now = new Date();
      if (petition.get("dueDate") < now) {
        flag = 2;
      }
      if (!flag) {
        petition.addUnique("signedUsersArray", signer);
        petition.increment("signatureNum");
        return petition.save();
      }
    }, (error) => {
      console.log("Error occured when retrieving petition: " + error);
    });
  if (flag == 1)
    return Promise.reject({ code: 125, message: "User has already signed this petition!" }); // 125 is the code number?
  if (flag == 2)
    return Promise.reject({ code: 126, message: "Deadline for this petition is reached!" });
  return 1;
}

app.post('/petition/sign', authenticateToken, (req, res) => {
  petitionId = req.body.petitionId;
  signer = req.user;
  signPetition(petitionId, signer).then(value => {
    console.log("Petition signed");
    res.status(201).send({ "OK": "ok" });
  }, reason => {
    if (reason.code == 125) {
      res.status(401);
      console.log("This user has signed this petition before!");
    }
    if (reason.code == 126) {
      res.status(403);
      console.log("Deadline for this petition is reached!");
    }
    res.send({ "message": reason.message });
  })
})


// RETRIEVING PETITIONS

const getPetitions = async () => {
  //console.log("Hello there!");
  const Petition = Parse.Object.extend("Petition");
  const query = new Parse.Query(Petition);
  const results = await query.find();
  console.log("Successfully retrieved " + results.length + " petitions.");
  let petitions = [];
  for (let i = 0; i < results.length; i++) {
    const object = results[i];
    this_post = {
      id: object.id,
      title: object.get('title'),
      content: object.get('content'),
      createdBy: object.get('createdBy'),
      createdAt: object.get('createdAt'),
      signatureNum: object.get('signatureNum'),
      dueDate: object.get('dueDate'),
      category: object.get('category')
      // no need to send the signatureDates
    }
    petitions.push(this_post);
  }
  return petitions;
}

app.get('/petition/retrieve', authenticateToken, (req, res) => {
  getPetitions().then(value => {
    res.json({
      "petition": value
    });
  }, reason => {
    res.send("something went wrong " + reason);
  });
})


// RETRIEVING ONE PETITION

const getSinglePetition = async (petitionId) => {
  const Petition = Parse.Object.extend("Petition");
  const query = new Parse.Query(Petition);
  console.log(petitionId);
  var this_petition;
  const object = await query.get(petitionId);
  var username;
  const createdBy_query = new Parse.Query("User");
  await createdBy_query.get(object.get('createdBy').id).then((userObject) => {
    username = userObject.get('username');
  }, (error) => {
    console.log("Error retrieving createdBy user!" + error);
  });
  this_petition = {
    id: object.id,
    title: object.get('title'),
    content: object.get('content'),
    createdBy: username,
    createdAt: object.get('createdAt'),
    signatureNum: object.get('signatureNum'),
    dueDate: object.get('dueDate'),
    category: object.get('category')
    // no need to send the signatureDates
  }
  return this_petition;
}

app.post('/petition/retrieve/single', authenticateToken, (req, res) => {
  console.log(req.body.petitionId);
  getSinglePetition(req.body.petitionId).then(value => {
    console.log("Successfully retrieved a single petition")
    res.json({
      "petition": value
    });
  }, reason => {
    res.send("something went wrong " + reason);
  });
})


// RETRIEVING USERS PETITIONS

const getUserPetitions = async (user) => {
  //console.log("Hello there!");
  const user_query = new Parse.Query("User");
  user_query.equalTo("username", user);
  const userObject = await user_query.find();
  const Petition = Parse.Object.extend("Petition");
  const query = new Parse.Query(Petition);
  //console.log(userObject);
  query.equalTo("createdBy", { "__type": "Pointer", "className": "_User", "objectId": userObject[0].id });
  const results = await query.find();
  console.log("Successfully retrieved " + results.length + " petitions.");
  let petitions = [];
  for (let i = 0; i < results.length; i++) {
    const object = results[i];
    var username;
    const createdBy_query = new Parse.Query("User");
    await createdBy_query.get(object.get('createdBy').id).then((userObject) => {
      username = userObject.get('username');
    }, (error) => {
      console.log("Error retrieving createdBy user!" + error);
    });

    this_post = {
      id: object.id,
      title: object.get('title'),
      content: object.get('content'),
      createdBy: username,
      createdAt: object.get('createdAt'),
      signatureNum: object.get('signatureNum'),
      dueDate: object.get('dueDate'),
      category: object.get('category')
      // no need to send the signatureDates
    }
    petitions.push(this_post);
  }
  return petitions;
}

app.get('/petition/userpetitions', authenticateToken, (req, res) => {
  let user = req.user;
  getUserPetitions(user).then(value => {
    res.json({
      "petition": value
    });
  }, reason => {
    res.send("something went wrong " + reason);
  });
})


// RETRIEVING 5 RANDOM PETITIONS

const compare = (a, b) => {
  const signNumA = a["signatureNum"];
  const signNumB = b["signatureNum"];
  return -(signNumA - signNumB);
}

app.get('/petition/retrieve/top', authenticateToken, (req, res) => {
  getPetitions().then(value => {
    value.sort(compare);
    first_five = value.slice(0, 6);
    res.json({
      "petition": value
    });
  }, reason => {
    res.send("something went wrong " + reason);
  });
})


// RETRIEVING CLOSED PETITIONS

app.get('/petition/retrieve/closed', authenticateToken, (req, res) => {
  getPetitions().then(value => {
    let closed = [];
    let now = new Date();
    console.log(now);
    for (let i = 0; i < value.length; i++) {
      if (value[i].dueDate !== undefined) {
        if (now > value[i].dueDate) {
          closed.push(value[i]);
          if (closed.length == 10)
            break;
        }
      }
    }
    res.json({
      "petition": closed
    });
  }, reason => {
    res.send("something went wrong " + reason);
  });
})


// RETRIEVING OPEN PETITIONS

app.get('/petition/retrieve/open', authenticateToken, (req, res) => {
  getPetitions().then(value => {
    let open = [];
    let now = new Date();
    for (let i = 0; i < value.length; i++) {
      if (value[i].dueDate === undefined || now < value[i].dueDate) {
        open.push(value[i]);
        if (open.length == 10)
          break;
      }
    }
    res.json({
      "petition": open
    });
  }, reason => {
    res.send("something went wrong " + reason);
  });
})


// SEARCHING USING CATEGORY

const getCategoryPetitions = async (category) => {
  const Petition = Parse.Object.extend("Petition");
  const query = new Parse.Query(Petition);
  query.equalTo("category", category);
  const results = await query.find();
  console.log("Successfully retrieved " + results.length + " petitions.");
  let petitions = [];
  for (let i = 0; i < results.length; i++) {
    const object = results[i];
    this_post = {
      id: object.get('objectId'),
      title: object.get('title'),
      content: object.get('content'),
      createdBy: object.get('createdBy'),
      createdAt: object.get('createdAt'),
      signatureNum: object.get('signatureNum'),
      dueDate: object.get('dueDate'),
      category: object.get('category')
      // no need to send the signatureDates
    }
    petitions.push(this_post);
  }
  return petitions;
}

app.get('/petition/search/category', authenticateToken, (req, res) => {
  let category = req.body.category;
  getCategoryPetitions(category).then(value => {
    res.json({
      "petition": value
    });
  }, reason => {
    res.send("something went wrong " + reason);
  });
})


// GETTING SIGNATURE DATES

const getSignatureDates = async (petitionId) => {
  const Petition = Parse.Object.extend("Petition");
  const query = new Parse.Query(Petition);
  var dates = [];
  await query.get(petitionId)
    .then((object) => {
      var signatureDates = object.get('signatureDates');
      for (let i = 0; i < signatureDates.length; i++) {
        const date = signatureDates[i];
        dates.push(date);
      }
    }, (error) => {
      console.log("Error occured when retrieving petition: " + error);
    });
  return dates;
}

app.get('/petition/dates', authenticateToken, (req, res) => {
  getSignatureDates(req.body.petitionId).then(value => {
    res.json({
      "dates": value
    });
  }, reason => {
    res.send("something went wrong " + reason);
  });
})


// DELETE PETITION

const destroyPetition = async (object) => {
  await object.destroy({});
}

const deletePetition = async (petitionId, user) => {
  const user_query = new Parse.Query("User");
  user_query.equalTo("username", user);
  const userObject = await user_query.find();
  const Petition = Parse.Object.extend("Petition");
  const query = new Parse.Query(Petition);
  await query.get(petitionId)
    .then((object) => {
      let createdBy = object.get('createdBy');
      if (createdBy.id === userObject[0].id) {
        destroyPetition(object).then(value => {
          console.log("Petition " + petitionId + " destroyed!");
          return "Done!"
        }, reason => {
          console.log("Destroy operation can't be done: " + reason);
        })
      }
    }, (error) => {
      console.log("Error occured when retrieving petition: " + error);
    });
  return Promise.reject("This user doesn't have the permission to delete this petition!");
}


app.delete('/petition/delete', authenticateToken, (req, res) => {
  console.log(req.body.petitionId);
  deletePetition(req.body.petitionId, req.user).then(value => {
    res.status(200).send({ 'OK': 'ok' });
  }, reason => {
    res.status(400).send({ "message": reason.message });
  })
})


// EDIT PETITION





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
