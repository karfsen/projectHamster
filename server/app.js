const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require("body-parser");
const cors = require('cors');
const db = require("./database");
const info = require("./secure-info");
const googleMapsClient = require('@google/maps').createClient({
  key: info.key,
  Promise: Promise
});

app.use(bodyParser.json());
app.use(cors());

console.log("Server started");
/*****************************************Code for websocket events*****************************************/
//Getting connections of client
io.on('connection', async (client) => {

  console.log("Client connected");
  //Webpage sends event "getdata" to the server  
  client.on('getdata', () => {
    console.log("Webclient requested for data!");
    //Server requests arduino for actual data
    io.emit('speed');
  });
  //Arduino sends event "speedJson" to the server
  client.on('speedJson', (event) => {
    //console.log(event);
    console.log("Arduino sent data,sending to WebClient...");
    if (event.speed > 0 && event.speed <= 100) {
      db.saveSpeed(event);
    }
    io.emit('data', event);
  });

  client.on('disconnect', () => {
    console.log('Client has disconnected');
  });
});
/*****************************************End of code for websocket events*****************************************/

app.get("/senddata", async (req, res) => {
  console.log("Request on /senddata");
  let result = await db.saveLastMinuteData(req.query.distance);
  res.status(result).send();
});

app.get("/distancetoday", async (req, res) => {
  console.log("Request on /distancetoday");
  let result = await db.getDistanceToday();
  console.log(result);
  res.status(result.status).send(result.data);
});

app.get("/todaylinegraph", async (req, res) => {
  console.log("Request on /todaylinegraph");
  let result = await db.todayLineGraph();
  console.log(result);
  res.status(result.status).send(result.data);
  console.log("Today line graph data sent to the client!");
});

app.get("/yesterdaylinegraph", async (req, res) => {
  console.log("Request on /yesterdaylinegraph");
  let result = await db.yesterdayLineGraph();
  res.status(result.status).send(result.data);
  console.log("Yesterday line graph data sent to the client!");
});

app.post("/newgoal", async (req, res) => {
  console.log("Request on /newgoal !");
  let result = await db.newDistanceGoal(req.body);
  res.status(result).send("New distance goal added successfully");
});

app.get("/showgoals", async (req, res) => {
  console.log("Request on /showgoals");
  let result = await db.getDistanceGoals();
  res.status(200).send(result);
  console.log("Data sent to the client!");
});

app.get("/showchargoals", async (req, res) => {
  console.log("Request on /showgoals");
  let result = await db.getChargingGoals();
  res.status(200).send(result);
  console.log("Data sent to the client!");
});

app.get("/todayawake", async (req, res) => {
  console.log("Request on /todayawake");
  let result = await db.getTodayAwake();
  res.status(200).send(result);
  console.log("Data sent to the client!");
});

app.get("/thisweekawake", async (req, res) => {
  console.log("Request on /thisweekawake");
  let result = await db.getThisWeekAwake();
  res.status(200).send(result);
  console.log("Data sent to the client!");
});

app.get("/thismonthawake", async (req, res) => {
  console.log("Request on /thismonthawake");
  let result = await db.getThisMonthAwake();
  res.status(200).send(result);
  console.log("Data sent to the client!");
});

app.get("/todaytopspeed", async (req, res) => {
  console.log("Request on /todaytopspeed");
  let result = await db.getTodayTopSpeed();
  res.status(200).send(result);
  console.log("Data sent to the client!");
});

app.get("/weektopspeed", async (req, res) => {
  console.log("Request on /weektopspeed");
  let result = await db.getWeekTopSpeed();
  res.status(200).send(result);
  console.log("Data sent to the client!");
});

app.get("/monthtopspeed", async (req, res) => {
  console.log("Request on /monthtopspeed");
  let result = await db.getMonthTopSpeed();
  res.status(200).send(result);
  console.log("Data sent to the client!");
});

app.get("/energytoday", async (req, res) => {
  console.log("Request on /energytoday");
  let result = await db.getEnergyToday();
  res.status(200).send(result);
  console.log("Data sent to the client!");
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

  res.status(200).send(JSON.stringify({ date: hour + ":" + minute + " " + day + ". " + month + " " + year }));
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
    }
    else {
      callback(403, JSON.stringify({ message: "These cities are unable to connect with distance matrix!" }));
    }
  }
  googleMapsClient.distanceMatrix({ origins: [depcity], destinations: [descity] }, handleDatacb);
});

app.post("/newchargegoal", async (req, res) => {
  console.log("Request on /newchargegoal !");
  await db.newChargeGoal();
  res.status(200).send();
});

app.post("/deletegoal", async (req, res) => {
  console.log("Request on /deletegoal");
  await db.deleteDistanceGoal();
  res.status(200).send();
  console.log("Data sent to the client!");
});

app.post("/deletechargoal", async (req, res) => {
  console.log("Request on /deletechargoal");
  await db.deleteChargingGoal();
  res.status(200).send();
  console.log("Data sent to the client!");
});

app.get("/thisweeklinegraph", async (req, res) => {
  console.log("Request on /thisweeklinegraph");
  let result = await db.getThisWeekLineGraph();
  res.status(200).send(result);
  console.log("This week data sent to the client!");
});

app.get("/thismonthlinegraph", async (req, res) => {
  console.log("Request on /thismonthlinegraph");
  let result = await db.getThisMonthLineGraph();
  res.status(200).send(result);
  console.log("This week data sent to the client!");
});


server.listen(1206, () => {
  console.log("Sever listening on port 1206");
});