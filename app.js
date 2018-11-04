var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
io.origins(['*:*']);
var port = process.env.PORT || 3000;
var db = require('./db');
var ObjectId = require('mongodb').ObjectID;

var indexRouter = require('./routes/index');
var playersRouter = require('./routes/players');
var campaignsRouter = require('./routes/campaigns');
var sessionsRouter = require('./routes/sessions');
var notesRouter = require('./routes/notes');

db.connect();

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

app.use('/', indexRouter);
app.use('/players', playersRouter);
app.use('/campaigns', campaignsRouter);
app.use('/sessions', sessionsRouter);
app.use('/notes', notesRouter);

server.listen(port, function() {
    console.log('Starting App on port: ' + port)
});

var nsp = io.of('/notes');
nsp.on('connection', function(socket) {
    var database = db.get();
    console.log("someone connected to notes");
    socket.on('get-notes', function(campaignId, playerId) {
        var query = { campaignId: new ObjectId(campaignId), playerId : new ObjectId(playerId) };
        database.collection("notes").find(query).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            console.log('getting notes for ' + playerId);
            socket.emit('myNotes', result);
        });
    });
});
