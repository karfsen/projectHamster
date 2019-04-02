let db = require('./db');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require("body-parser");

app.use(bodyParser.json());

io.set('origins', '*:*');
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Origin,Accept,Content-Type");
    res.header('Access-Control-Allow-Methods', 'POST, GET')
    next();
  });  

console.log("Server started");
io.on('connection', client =>{ 
    console.log("Client connected");

    client.on('join', room => {
        client.join(room);
        console.log('client joined to ' + room);
    });
	   
	client.on('arduinoData', event =>{ 
        db.writeData(event);
        io.to('webclient').emit('weatherData', event);
        console.log("Latest data sent to client");
    });
});