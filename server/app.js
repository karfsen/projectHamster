const app = require('express')();
const bodyParser = require("body-parser");
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());
const server = require('http').createServer(app);
const io = require('socket.io')(server,{
  cors:{
    origin: "http://itsovy.sk",
    methods: ["GET", "POST"],
  }
});

const db = require("./database");
const info = require("./secure-info");
const googleMapsClient = require('@google/maps').createClient({
  key: info.key,
  Promise: Promise
});

console.log("Server started");
/*****************************************Code for websocket events*****************************************/
//Getting connections of client
io.on('connection', (client) => {
  
  console.log("Client connected");
  //Webpage sends event "getdata" to the server  
  client.on('getdata', () => {
    console.log("Webclient requested for data!");
    //Server requests arduino for actual data
    io.emit('speed');
  });
  //Arduino sends event "speedJson" to the server
  client.on('speedJson', (event) => {
    console.log("Arduino sent data,sending to WebClient...");
    if (event.speed >= 0 && event.speed <= 100) {
      db.saveSpeed(event);
      io.emit('data', event);
    }else {
      db.saveSpeed({speed:100});
      io.emit("data",{"speed":"100"});
    }
  });

  client.on('disconnect', () => {
    console.log('Client has disconnected');
  });
});
/*****************************************End of code for websocket events*****************************************/

app.get("/senddata", (req, res) => {
  console.log("Request on /senddata "+req.query.distance);
  db.saveLastMinuteData(req.query.distance)
    .then(() => res.status(200).send())
    .catch(err => res.status(500).send("Internal server error\n" + err));
});

app.get("/distancetoday", (req, res) => {
  console.log("Request on /distancetoday");
  db.getDistanceToday()
    .then(result => {
      console.log(result);
      res.status(200).send(result.data);
    })
    .catch(err => res.status(500).send("Internal server error\n" + err));
});

app.get("/todaylinegraph", (req, res) => {
  console.log("Request on /todaylinegraph");
  db.todayLineGraph()
    .then(result => {
      console.log(result);
      res.status(result.status).send(result.data);
      console.log("Today line graph data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error \n" + err));
});

app.get("/yesterdaylinegraph", (req, res) => {
  console.log("Request on /yesterdaylinegraph");
  db.yesterdayLineGraph()
    .then(result => {
      res.status(result.status).send(result.data);
      console.log("Yesterday line graph data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error \n" + err));
});

app.post("/newgoal", (req, res) => {
  console.log("Request on /newgoal !");
  db.newDistanceGoal(req.body)
    .then(result => res.status(result).send("New distance goal added successfully"))
    .catch(err => res.status(500).send("Internal Server error \n" + err));
});

app.get("/showgoals", (req, res) => {
  console.log("Request on /showgoals");
  db.getDistanceGoals()
    .then(result => {
      res.status(200).send(result);
      console.log("Data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.get("/showchargoals", (req, res) => {
  console.log("Request on /showgoals");
  db.getChargingGoals()
    .then(result => {
      res.status(200).send(result);
      console.log("Data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.get("/todayawake", (req, res) => {
  console.log("Request on /todayawake");
  db.getTodayAwake()
    .then(result => {
      res.status(200).send(result);
      console.log("Data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.get("/thisweekawake", (req, res) => {
  console.log("Request on /thisweekawake");
  db.getThisWeekAwake()
    .then(result => {
      res.status(200).send(result);
      console.log("Data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.get("/thismonthawake", (req, res) => {
  console.log("Request on /thismonthawake");
  db.getThisMonthAwake()
    .then(result => {
      res.status(200).send(result);
      console.log("Data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.get("/todaytopspeed", (req, res) => {
  console.log("Request on /todaytopspeed");
  db.getTodayTopSpeed()
    .then(result => {
      res.status(200).send(result);
      console.log("Data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.get("/weektopspeed", (req, res) => {
  console.log("Request on /weektopspeed");
  db.getWeekTopSpeed()
    .then(result => {
      res.status(200).send(result);
      console.log("Data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.get("/monthtopspeed", (req, res) => {
  console.log("Request on /monthtopspeed");
  db.getMonthTopSpeed()
    .then(result => {
      res.status(200).send(result);
      console.log("Data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.get("/energytoday", (req, res) => {
  console.log("Request on /energytoday");
  db.getEnergyToday()
    .then(result => {
      res.status(200).send(result);
      console.log("Data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.get("/getupdatetime", (req, res) => {
  console.log("Request on /getupdatetime");

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  let year = new Date().getFullYear();
  let month = monthNames[new Date().getMonth()];
  let day = new Date().getDate();
  let hour = new Date().getHours();
  let minute = new Date().getMinutes();

  res.status(200).send(JSON.stringify({
    date: hour + ":" + minute + " " + day + ". " + month + " " + year
  }));
});

app.post("/getDistance", (req, res, callback) => {
  console.log("Request on /getDistance");
  callback = function (status, result) {
    res.status(status).send(result);
  };

  let depcity = req.body.departure;
  let descity = req.body.destination;

  console.log(depcity + " " + descity);

  function handleDatacb(response, status) {
    if (status.json.rows[0].elements[0].status !== "ZERO_RESULTS") {
      let descity = status.json.destination_addresses[0];
      let depcity = status.json.origin_addresses[0];
      let info = status.json.rows[0].elements[0].distance;

      let obj = new Object();
      obj.departCity = depcity;
      obj.destinCity = descity;
      obj.info = info;
      callback(200, JSON.stringify(obj));
    } else {
      callback(403, JSON.stringify({
        message: "These cities are unable to connect with distance matrix!"
      }));
    }
  }
  googleMapsClient.distanceMatrix({
    origins: [depcity],
    destinations: [descity]
  }, handleDatacb);
});

app.post("/newchargegoal", (req, res) => {
  console.log("Request on /newchargegoal !");
  db.newChargeGoal(req.body)
    .then(result => {
      res.status(200).send();
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.post("/deletegoal", (req, res) => {
  console.log("Request on /deletegoal");
  db.deleteDistanceGoal(req.body.id)
    .then(() => {
      res.status(200).send();
      console.log("Data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.post("/deletechargoal", (req, res) => {
  console.log("Request on /deletechargoal");
  db.deleteChargingGoal(req.body.id)
    .then(() => {
      res.status(200).send();
      console.log("Data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.get("/thisweeklinegraph", (req, res) => {
  console.log("Request on /thisweeklinegraph");
  db.getThisWeekLineGraph()
    .then(result => {
      res.status(200).send(result);
      console.log("This week data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});

app.get("/thismonthlinegraph", (req, res) => {
  console.log("Request on /thismonthlinegraph");
  db.getThisMonthLineGraph()
    .then(result => {
      res.status(200).send(result);
      console.log("This week data sent to the client!");
    })
    .catch(err => res.status(500).send("Internal Server error\n" + err));
});


server.listen(1206, () => {
  console.log("Sever listening on port 1206");
});