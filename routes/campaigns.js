//import { Schema, Mongoose } from 'mongoose';

var express = require('express');
var router = express.Router();

var Mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var db = require('../db');

var campaignSchema = Mongoose.Schema({
    _id : ObjectId,
    name : String,
    date : Date,
    dungeonMaster : { type: ObjectId, ref: 'players' },
    players : [{type:Mongoose.Schema.Types.ObjectId, ref: 'players'}]
});

var playerSchema = Mongoose.Schema({
    _id : ObjectId,
    firstname : String,
    surname : String,
    email : String,
    username : String,
    password : String
});

var campaign = Mongoose.model('campaigns', campaignSchema);
var players = Mongoose.model('players', playerSchema);


router.get('/', function(req, res, next) {
    var database = db.get();
    campaign.find({}).populate('dungeonMaster', '-password').populate('players', '-password').exec(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

router.get('/id/:id', function(req, res) {
    var database = db.get();
    var query = { _id: new ObjectId(req.params.id) };
    campaign.find(query).populate('dungeonMaster', '-password').populate('players', '-password').exec(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

router.get('/playerid/:id', function(req, res) {
    var database = db.get();
    var query = { $or: [{players: new ObjectId(req.params.id)}, {dungeonMaster: new ObjectId(req.params.id)}] };
    var result = [];
    campaign.find(query).populate('dungeonMaster', '-password').populate('players', '-password').exec(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
  });

  router.get('/:playerid/create', function(req, res) {
    var database = db.get();

    var campaign = {
        _id : new ObjectId(),
        name : 'New campaign',
        date  : new Date(),
        dungeonMaster : ObjectId(req.params.playerid),
        players : [],
    }
    database.collection("campaigns").insertOne(campaign, function(err, result) {
        if (err) throw err;
        res.json(campaign);
    });
});

  router.post('/remove', function(req, res) {
    var database = db.get();
    var query = { "_id": ObjectId(req.body.campaignId) };

    database.collection("campaigns").find(query).toArray(function(err, result) {
        if(result != null && result.length > 0) {
            if (result[0].dungeonMaster == req.body.userId) {
                database.collection("campaigns").remove(query, function(err, result) {
                    if (err) {
                        console.log("err");
                        response = {
                            message : err.message,
                            deleted : false
                        }
                        res.json(response);
                    } else {
                        console.log("succes");
                        response = {
                            message : "succes",
                            deleted : true
                        }
                        res.json(response);
                    }
                });
            } else {
                response = {
                    message : "ERROR: NOT DM!",
                    deleted : false
                }
                res.json(response);
            }
        }
        else {
            response = {
                message : "no campaign found",
                deleted : false
            }
            res.json(response);
        }
    });
});

router.post('/update', function(req, res) {
    var database = db.get();
    var query = { "_id": ObjectId(req.body._id) };
    var newValues = { $set: {name: req.body.name, dungeonMaster: req.body.dungeonMaster, players: req.body.players } };
    database.collection("campaigns").updateOne(query, newValues, function(err, result) {
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

router.post('/changename', function(req, res) {
    var database = db.get();
    var query = { "_id": ObjectId(req.body.campaignId) };
    var newValues = { $set: {name: req.body.name} };
    database.collection("campaigns").updateOne(query, newValues, function(err, result) {
        var response;
        if (err) {
            response = {
                message : "ERROR: failed to change the campaign name.",
                updated : false
            }
        } else {
            response = {
                message : "successfully changed the campaign name.",
                updated : true
            }
        }
        res.json(response);
    });
});

module.exports = router;