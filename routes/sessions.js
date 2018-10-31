var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var db = require('../db');

router.get('/', function(req, res, next) {
    var database = db.get();
    database.collection("sessions").find({}).toArray(function(err, result) {
        if (err) throw err;
        res.json(result);
      });
});

router.get('/:campaignId', function(req, res) {
    var database = db.get();

    var query = { campaignId: new ObjectId(req.params.campaignId) };
    database.collection("sessions").find(query).toArray(function(err, result) {
        if (err) throw err;
        res.json(result);
    });
});

router.get('/:campaignId/create', function(req, res) {
    var database = db.get();

    var session = {
        _id : new ObjectId(),
        _campaignId : req.params.campaignId,
        name : 'New',
        date  :new Date(),
        text : "edit me!"
    }

    database.collection("sessions").insertOne(session, function(err, result) {
        if (err) throw err;
        res.json(session);
    });
});



router.post('/remove', function(req, res) {
    var database = db.get();
    var query = { "_id": ObjectId(req.body._id) };
    database.collection("sessions").remove(query, function(err, result) {
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
    var newValues = { $set: {name: req.body.name, text: req.body.text } };
    database.collection("sessions").updateOne(query, newValues, function(err, result) {
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