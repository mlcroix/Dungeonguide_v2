var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var dotEnv = require('dotenv').config();

exports.connect = function() {
	mongoose.connect(process.env.DB_ConnectionString);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', function () {
        console.log("connected");
        database = db;
    });
}
exports.get = function() {
   if(database) {
       return database;
   }
}

exports.close = function() {
    db.close();
}
