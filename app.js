var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
io.origins(['*:*']);
var port = process.env.PORT || 3000;
var db = require('./db');

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

server.listen(port, function() {
    console.log('Starting App on port: ' + port)
});

app.use('/', indexRouter);
app.use('/players', playersRouter);
app.use('/campaigns', campaignsRouter);
app.use('/sessions', sessionsRouter);
app.use('/notes', notesRouter);

/*

app.get('/', function (req, res) {
    res.json("welcome");
});
*/

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

var nsp = io.of('/meep');
nsp.on('connection', function(socket) {
   console.log('someone connected meep');
   socket.on('meep added',function(){
        io.emit('meep');
   });
   socket.on('disconnect', () => console.log('Client stopped meeping'));
});