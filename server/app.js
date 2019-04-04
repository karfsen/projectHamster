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
	   
	client.on('arduinoData', event =>{ 
        db.writeData(event);
        io.to('webclient').emit('speed', event);
        console.log("Data got!");
    });
});


//TODO-DATABASE+GETDATAFROMARDUINO

app.post("/senddata",(req,res,callbacksd)=>{
    console.log("Request on /sendsteps");
    //console.log(req);
    //console.log(req.body);
    callbacksd=function(status){
      res.status(status).send();
    };
  
    let con=mysql.createConnection({
      host: "localhost",
      user: "hamster",
      password: "1605",
      database: "hamster",
      port: "3307"
  });
  
  //let arduinoid=req.body.arduinoid;
  let data=req.body.data;
  console.log(data);
  
  con.connect((err)=>{
        if (err) console.log(err);
        let insertSQL="INSERT INTO data(thisSessionSteps)"+
        " VALUES("+id+","+sessionSteps+");";
        con.query(insertSQL,(err)=>{
        if(err) console.log(err);
        console.log("I have inserted data to database!");
        callbackSS(200);
        });
        con.end();
    });
});


app.listen(1206,()=>{
    console.log("Sever listening on port 1206");
});