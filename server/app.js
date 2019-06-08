var http = require("http");
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require("body-parser");
const cors=require('cors');
const mysql = require('mysql');
const googleMapsClient = require('@google/maps').createClient({
  key: ,
  Promise:Promise
});

app.use(bodyParser.json());
app.use(cors());

let con=mysql.createConnection({
  host: "localhost",
  user: "hamster",
  password: "1605",
  database: "hamster",
  port: "3307"
});
con.connect();


console.log("Server started");
io.on('connection', client =>{ 
    console.log("Client connected");
	   
	client.on('getdata', () =>{
      console.log("Webclient requested for data!");
      io.emit('speed');
  });

  client.on('speedJson', (event) =>{
    console.log(event);
    console.log("Arduino sent data,sending to WebClient...");
    if(event.speed>0){
        let sql="INSERT INTO speeds values(id,CURRENT_TIMESTAMP,"+event.speed+");";
        con.query(sql,(err)=>{
          if(err) console.log(err);
          console.log("SpeedData inserted");
        });
    }
    io.emit('data',event);
  });

  client.on('disconnect', ()=>{
	    console.log('Client has disconnected');
  });
});

app.get("/senddata",(req,res,callbacksd)=>{
    console.log("Request on /senddata");
    callbacksd=function(status){
      res.status(status).send();
    };
  
  let distance=req.query.distance;
  console.log(distance);
  
  let insertSQL="INSERT INTO data(distanceCM) values("+distance+");";
  con.query(insertSQL,(err)=>{
    if(err) console.log(err);
    console.log("I have inserted data to database!");
    callbacksd(200);
  });
});

app.get("/distancetoday",(req,res,callbackdt)=>{
  console.log("Request on /distancetoday");
  callbackdt=function(status,result){
    res.status(status).send(result);
  };

  let day=new Date().getDate();
  let month=new Date().getMonth()+1;
  let year=new Date().getFullYear();

  if(month<10)
    month="0"+month;
  if(day<10)
    day="0"+day;

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
});

app.get("/todaylinegraph",(req,res,callbacktlg)=>{
    console.log("Request on /todaylinegraph");
    callbacktlg=function(status,result){
      res.status(status).send(result);
    };
  
  let day=new Date().getDate();
  let month=new Date().getMonth()+1;
  let year=new Date().getFullYear();
  console.log(day+" "+month+" "+year);

  if(month<10)
    month="0"+month;
  if(day<10)
    day="0"+day;


  let todaydistance="select hour(time) as hour,sum(distancecm) as distancecm from data where time>='"+year+"-"+month+"-"+day+" 00:00:00' group by hour(time);";

  //console.log(todaydistance);
  con.query(todaydistance,(err,res)=>{
    if(err) console.log(err);
    let obj=[];
    res.forEach(element=>{
      obj.push({hour:element.hour+1,distance:element.distancecm/100.0});
    });
    callbacktlg(200,JSON.stringify(obj));
    console.log("Today ata sent to the client!");
    //console.log(JSON.stringify(res));
  });
});

app.get("/yesterdaylinegraph",(req,res,callbackylg)=>{
  console.log("Request on /yesterdaylinegraph");
  callbackylg=function(status,result){
    res.status(status).send(result);
  };
  
  let today=new Date().getDate();
  let yesterday=new Date().getDate()-1;
  let month=new Date().getMonth()+1;
  let year=new Date().getFullYear();

  //console.log(day+" "+month+" "+year);
  if(month<10)
    month="0"+month;
  if(today<10)
    today="0"+today;
  if(yesterday<10)
    yesterday="0"+yesterday;

    let todaydistance="select hour(time) as hour,sum(distancecm) as distancecm from data where time between '"+year+"-"+month+"-"+yesterday+" 00:00:00' and '"+year+"-"+month+"-"+today+" 00:00:00' group by hour(time);";
    //console.log(todaydistance);
  con.query(todaydistance,(err,res)=>{
    if(err) console.log(err);
    let obj=[];
    res.forEach(element=>{
      obj.push({hour:element.hour+1,distance:element.distancecm/100.0});
    });
    console.log(obj);
    callbackylg(200,JSON.stringify(obj));
    console.log("Yesterday data sent to the client!");
  });
});

app.post("/newgoal",(req,res,callbackng)=>{
  console.log("Request on /newgoal !");
  callbackng=function(status){
    res.status(status).send();
  };

  let type=req.body.type;
  let deploc=req.body.deploc;
  let desloc=req.body.desloc;
  let distance=req.body.distance;
  let remaining=req.body.distance;

  let insertSQL="INSERT INTO DistanceGoals(type,DepLoc,DesLoc,distance,remaining) values("+type+",'"+deploc+"','"+desloc+"',"+distance+","+remaining+");";
  con.query(insertSQL,(err)=>{
    if(err) console.log(err);
    console.log("I have inserted new goal to database!");
    callbackng(200);
  });
});

app.get("/showgoals",(req,res,callbacksdg)=>{
  console.log("Request on /showdistancegoals");
  callbacksdg=function(status,result){
    res.status(status).send(result);
  };;

  let todaydistance="SELECT id,(DATE_FORMAT(time, '%d.%m.%Y %H:%i')) as time,DepLoc,DesLoc,distance,remaining from DistanceGoals where done=0";
  //console.log(todaydistance);
  con.query(todaydistance,(err,res)=>{
  if(err) console.log(err);
    callbacksdg(200,res);
    console.log("Data sent to the client!");
  });
});

app.get("/todayawake",(req,res,callbacktta)=>{
  console.log("Request on /todayawake");
  callbackta=function(status,result){
    res.status(status).send(result);
  };

  let day=new Date().getDate();
  let month=new Date().getMonth()+1;
  let year=new Date().getFullYear();
  console.log(day+" "+month+" "+year);

  if(month<10)
    month="0"+month;
  if(day<10)
    day="0"+day;

  let todayawake="select count(id) as todaymins where time >='"+year+"-"+month+"-"+yesterday+" 00:00:00';";
  //console.log(todaydistance);
  con.query(todayawake,(err,res)=>{
    if(err) console.log(err);
    callbacktta(200,res);
    console.log("Data sent to the client!");
  });
});

//TODO topSpeed tabuľka v DB
//
//
//
//
//
app.get("/todaytopspeed",(req,res,callbacktts)=>{
  console.log("Request on /todaytopspeed");
  callbacktts=function(status,result){
    res.status(status).send(result);
  };

  let day=new Date().getDate();
  let month=new Date().getMonth()+1;
  let year=new Date().getFullYear();
  console.log(day+" "+month+" "+year);

  if(month<10)
    month="0"+month;
  if(day<10)
    day="0"+day;

  let todayawake="select time,max(speed) from speeds where time >='"+year+"-"+month+"-"+yesterday+" 00:00:00';";
  //console.log(todaydistance);
  con.query(todayawake,(err,res)=>{
    if(err) console.log(err);
    callbacktts(200,res);
    console.log("Data sent to the client!");
  });
});

//
//
//
//
//

app.get("/energytoday",(req,res,callbacket)=>{
  console.log("Request on /energytoday");
  callbacket=function(status,result){
    res.status(status).send(result);
  };

  let day=new Date().getDate();
  let month=new Date().getMonth()+1;
  let year=new Date().getFullYear();

  if(month<10)
    month="0"+month;
  if(day<10)
    day="0"+day;

  let todaydistance="SELECT distancecm from data where time >='"+year+"-"+month+"-"+day+" 00:00:00';";
  //console.log(todaydistance);
  con.query(todaydistance,(err,res)=>{
    if(err) console.log(err);
    if(res!=null){
      let obj=new Object();
      let count=0;
      res.forEach(element => {
        if(element.distancecm/20/100*55.5<55.5){
          count=count+element.distancecm/20/100*55.5;
        }
        else{
          count=count+55.5;
        }
      });
      obj.entoday=Math.round(count*100)/100;
      callbacket(200,JSON.stringify(obj));
    }
    else{
      let obj=new Object();
      obj.entoday=0.0;
      callbacket(200,JSON.stringify(obj));
    }
    console.log("Data sent to the client!");
  });
});

app.get("/getupdatetime",(req,res,callbackut)=>{
  console.log("Request on /getupdatetime");
  callbackut=function(status,result){
    res.status(status).send(result);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];

  let year=new Date().getFullYear();
  let month=monthNames[new Date().getMonth()];
  let day=new Date().getDate();
  let hour=new Date().getHours();
  let minute=new Date().getMinutes();

  callbackut(200,JSON.stringify({date:hour+":"+minute+" "+day+". "+month+" "+year}));


});


app.post("/getDistance",(req,res,callbackgD)=>{
  console.log("Request on /getDistance");
  callbackgD=function(status,result){
    res.status(status).send(result);
  };

  let depcity=req.body.departure;
  let descity=req.body.destination;

    console.log(depcity+" "+descity);

    function callback(response, status) {
      console.log(response);
      console.log(status);
      if (status.json.rows[0].elements[0].status !== "ZERO_RESULTS") {
        let descity=status.json.destination_addresses[0];
        let depcity=status.json.origin_addresses[0];
        let info=status.json.rows[0].elements[0].distance;
        
        let obj=new Object();
        obj.departCity=depcity;
        obj.destinCity=descity;
        obj.info=info;
        callbackgD(200,JSON.stringify(obj));
      }
      else{
        callbackgD(403,JSON.stringify({message:"These cities are unable to connect with distance matrix!"}));
      }
    }
  
    googleMapsClient.distanceMatrix({origins:[depcity],destinations:[descity]},callback);

});

app.post("/deletegoal",(req,res,callbackdg)=>{
  console.log("Request on /deletegoal");
  callbackdg=function(status,result){
    res.status(status).send(result);
  };

  let todayawake="DELETE from DistanceGoals where id="+req.body.id;
  //console.log(todaydistance);
  con.query(todayawake,(err,res)=>{
    if(err) console.log(err);
    callbackdg(200);
    console.log("Data sent to the client!");
  });
});

server.listen(1206,()=>{
    console.log("Sever listening on port 1206");
});