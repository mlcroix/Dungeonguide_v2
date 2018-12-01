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
        console.log(result);
        res.json(result);
      });
});

router.get('/username/:username', function(req, res) {
    var database = db.get();
    var query = { username: req.params.username };
    database.collection("players").find(query).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.json(result);
    });
});

router.post('/login', function(req, res) {
    var database = db.get();
    var post = req.body;
    var username = post.username;
    var query = { username: username };
    try {
        var currUser = database.collection("players").find(query).toArray(function(err, result) {
            if (result.length != 0 && result[0].username == username && encryption.decrypt(result[0].password) == post.password){
                delete result[0].password;
                res.json(result[0])
            }
            else {
                res.status(404);
                res.json({message: "Not Found"});
            }
        });
    }
    catch(err) {
        console.log(err);
        res.status(404);
        res.json({message: "Not Found"});
    }
});

router.post('/signup', function(req, res) {
    var database = db.get();
    var post = req.body;
    var query = { $or: [{username: post.username}, {email : post.email }] };
    try {
        var currUser = database.collection("players").find(query).toArray(function(err, result) {
            if (result.length == 0){

                var player = {
                    _id : new ObjectId(),
                    firstname : post.firstname,
                    surname : post.surname,
                    email : post.email,
                    username : post.username,
                    password : encryption.encrypt(post.password)
                }
                database.collection("players").insertOne(player, function(err, result) {
                    if (err) throw err;
                    res.json(player);
                });
            }
            else {
                res.status(404);
                res.json({message: "Not Found"});
            }
        });
    }
    catch(err) {
        console.log(err);
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
