var express = require('express');
var router = express.Router();
var encryption = require('../encryption');

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var db = require('../db');

router.get('/', function(req, res, next) {
    var database = db.get();
    database.collection("players").find({}).toArray(function(err, result) {
        if (err) throw err;
        res.json(result);
      });
});

router.get('/username/:username', function(req, res) {
    var database = db.get();
    console.log(req.params.username.toLowerCase());
    var query = { lowCaseUsername: req.params.username.toLowerCase() };
    database.collection("players").find(query).toArray(function(err, result) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/login', function(req, res) {
    var database = db.get();
    var query = { $and: [{lowCaseUsername: req.body.username.toLowerCase()}, {password: encryption.encrypt(req.body.password)}] }
    try {
        var currUser = database.collection("players").find(query).toArray(function(err, result) {
            if (result.length != 0){
                console.log("login");
                delete result[0].password;
                res.json(result[0])
            }
            else {
                console.log("incorrect");
                res.status(201);
                res.json({message: "Not Found"});
            }
        });
    }
    catch(err) {
        res.status(404);
        res.json({message: "Not Found"});
    }
});

router.post('/signup', function(req, res) {
    var database = db.get();
    var post = req.body;
    var query = { $or: [{lowCaseUsername: post.username.toLowerCase()}, {email : post.email.toLowerCase() }] };
    try {
        var currUser = database.collection("players").find(query).toArray(function(err, result) {
            if (result.length == 0){
                var player = {
                    _id : new ObjectId(),
                    firstname : post.firstname,
                    surname : post.surname,
                    email : post.email,
                    username : post.username,
                    lowCaseUsername : post.username.toLowerCase(),
                    password : encryption.encrypt(post.password)
                }
                database.collection("players").insertOne(player, function(err, result) {
                    if (err) throw err;
                    res.json(player);
                });
            }
            else {
                if (result[0].username == post.username) {
                    res.status(201);
                    res.json({message: "user with the same name already exists"});
                }
                else if (result[0].email == post.email) {
                    res.status(201);
                    res.json({message: "user with the same email adres already exists"});
                }
                else {
                    res.status(201);
                    res.json({message: "user already exists"});
                }
            }
        });
    }
    catch(err) {
        res.status(404);
        res.json({message: "Not Found"});
    }
});

router.post('/validate', function(req, res) {
    var database = db.get();
    var post = req.body;
    var query = { $or: [{lowCaseUsername: post.username.toLowerCase()}, {email : post.email.toLowerCase() }] };
    try {
        var currUser = database.collection("players").find(query).toArray(function(err, result) {
            if (result.length == 0){
                res.status(200);
                res.json({message: "succes"});
            }
            else {
                if (result[0].username == post.username) {
                    res.status(201);
                    res.json({message: "user with the same name already exists"});
                }
                else if (result[0].email == post.email) {
                    res.status(201);
                    res.json({message: "user with the same email adres already exists"});
                }
                else {
                    res.status(201);
                    res.json({message: "user already exists"});
                }
            }
        });
    }
    catch(err) {
        res.status(404);
        res.json({message: "Not Found"});
    }
});

router.post('/remove', function(req, res) {
    var database = db.get();
    var query = { "_id": ObjectId(req.body._id) };
    database.collection("players").remove(query, function(err, result) {
        var response;
        if (err) {
            response = {
                message : err,
                deleted : false
            }
        } else {
            response = {
                message : "succes",
                deleted : true
            }
        }
        res.json(response);
    });
});

router.post('/update', function(req, res) {
    var database = db.get();
    var query = { "_id": ObjectId(req.body._id) };
    var newValues = { $set: {name: req.body.name, username: req.body.username, password: req.body.password } };
    database.collection("players").updateOne(query, newValues, function(err, result) {
        var response;
        if (err) {
            response = {
                message : err,
                updated : false
            }
        } else {
            response = {
                message : "succes",
                updated : true
            }
        }
        res.json(response);
    });
});

module.exports = router;
