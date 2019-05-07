const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require("body-parser");
const cors=require('cors');
const mysql = require('mysql');

app.use(bodyParser.json());
app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Origin,Accept,Content-Type");
    res.header('Access-Control-Allow-Methods', 'POST, GET')
    next();
  });  

console.log("Server started");
io.on('connection', client =>{ 
    console.log("Client connected");
	   
	client.on('speed', event =>{
        console.log("New io event speed!");
        io.emit('speed', event);
    });

//TODO-DATABASE+GETDATAFROMARDUINO


    client.on('disconnect', ()=>{
	    console.log('Client has disconnected');
    });
});

app.get("/senddata",(req,res,callbacksd)=>{
    console.log("Request on /senddata");
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
  
  let distance=req.query.distance;
  console.log(distance);
  
  con.connect((err)=>{
        if (err) console.log(err);
        let insertSQL="INSERT INTO data(distanceCM) values("+distance+");";
        con.query(insertSQL,(err)=>{
        if(err) console.log(err);
        console.log("I have inserted data to database!");
        callbacksd(200);
        });
        con.end();
    });
});

app.get("/distancetoday",(req,res,callbackdt)=>{
    console.log("Request on /distancetoday");
    callbackdt=function(status,result){
      res.status(status).send(result);
    };
  
    let con=mysql.createConnection({
      host: "localhost",
      user: "hamster",
      password: "1605",
      database: "hamster",
      port: "3307"
  });
  
  let day=new Date().getDate();
  let month=new Date().getMonth()+1;
  let year=new Date().getFullYear();

  if(month<10)
    month="0"+month;
  if(day<10)
    day="0"+day;


  con.connect((err)=>{
        if (err) console.log(err);
        let todaydistance="SELECT sum(distanceCM) as dis from data where time >='"+year+"-"+month+"-"+day+" 00:00:00';";
        //console.log(todaydistance);
        con.query(todaydistance,(err,res)=>{
        if(err) console.log(err);
        if(res[0].dis!=null){
          let obj=new Object();
          obj.distancetoday=res[0].dis;
          callbackdt(200,JSON.stringify(obj));
        }
        else{
          let obj=new Object();
          obj.distancetoday=0;
          callbackdt(200,JSON.stringify(obj));
        }

        console.log("Data sent to the client!");
        });
        con.end();
    });
});

app.get("/todaylinegraph",(req,res,callbacktlg)=>{
    console.log("Request on /todaylinegraph");
    callbacktlg=function(status,result){
      res.status(status).send(result);
    };
  
    let con=mysql.createConnection({
      host: "localhost",
      user: "hamster",
      password: "1605",
      database: "hamster",
      port: "3307"
  });
  
  let day=new Date().getDate();
  let month=new Date().getMonth()+1;
  let year=new Date().getFullYear();
  console.log(day+" "+month+" "+year);

  if(month<10)
    month="0"+month;
  if(day<10)
    day="0"+day;


  con.connect((err)=>{
    if (err) console.log(err);
    let todaydistance="SELECT (DATE_FORMAT(time, '%d.%m.%Y %H:%i')) as time,distanceCM from data where time >='"+year+"-"+month+"-"+day+" 00:00:00';";
    //console.log(todaydistance);
    con.query(todaydistance,(err,res)=>{
        if(err) console.log(err);
        callbacktlg(200,res);
        console.log("Data sent to the client!");
    });
    con.end();
    });
});

app.get("/yesterdaylinegraph",(req,res,callbackylg)=>{
    console.log("Request on /yesterdaylinegraph");
    callbackylg=function(status,result){
      res.status(status).send(result);
    };
  
    let con=mysql.createConnection({
      host: "localhost",
      user: "hamster",
      password: "1605",
      database: "hamster",
      port: "3307"
  });
  
  let day=new Date().getDate()-1;
  let month=new Date().getMonth()+1;
  let year=new Date().getFullYear();

  console.log(day+" "+month+" "+year);
  if(month<10)
    month="0"+month;
  if(day<10)
    day="0"+day;


  con.connect((err)=>{
    if (err) console.log(err);
    let todaydistance="SELECT (DATE_FORMAT(time, '%d.%m.%Y %H:%i')) as time,distanceCM from data where time ='"+year+"-"+month+"-"+day+"';";
    //console.log(todaydistance);
    con.query(todaydistance,(err,res)=>{
        if(err) console.log(err);
        callbackylg(200,res);
        console.log("Data sent to the client!");
    });
    con.end();
    });
});

app.post("/newdistancegoal",(req,res,callbackng)=>{
    console.log("Request on /newgoal !");
    callbackng=function(status){
        res.status(status).send();
      };
    
      let con=mysql.createConnection({
        host: "localhost",
        user: "hamster",
        password: "1605",
        database: "hamster",
        port: "3307"
    });

    let type=req.body.type;
    let deploc=req.body.deploc;
    let desloc=req.body.desloc;
    let distance=req.body.distance;
    let remaining=req.body.distance;

    con.connect((err)=>{
        if (err) console.log(err);
        let insertSQL="INSERT INTO DistanceGoals(type,DepLoc,DesLoc,distance,remaining) values("+type+",'"+deploc+"','"+desloc+"',"+distance+","+remaining+");";
        con.query(insertSQL,(err)=>{
        if(err) console.log(err);
        console.log("I have inserted new goal to database!");
        callbackng(200);
        });
        con.end();
    });
});

app.get("/showdistancegoals",(req,res,callbacksdg)=>{
    console.log("Request on /showdistancegoals");
    callbacksdg=function(status,result){
      res.status(status).send(result);
    };
  
    let con=mysql.createConnection({
      host: "localhost",
      user: "hamster",
      password: "1605",
      database: "hamster",
      port: "3307"
  });
  con.connect((err)=>{
    if (err) console.log(err);
    let todaydistance="SELECT * from DistanceGoals";
    //console.log(todaydistance);
    con.query(todaydistance,(err,res)=>{
    if(err) console.log(err);
    callbacksdg(200,res);
    console.log("Data sent to the client!");
    });
    con.end();
});

});

server.listen(1206,()=>{
    console.log("Sever listening on port 1206");
});