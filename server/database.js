const mysql = require('mysql2');
const express = require('express');
const info = require("./secure-info.json");

let con;

function handleDisconnect() {
    con = mysql.createConnection(info.mysqlCon);

    con.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
        else {
            console.log("connected to DB");
        }
    });
    con.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = {

    async saveSpeed(event) {
        let sql = "INSERT INTO speeds values(id,CURRENT_TIMESTAMP," + 0.036 * event.speed + ");";
        await con.query(sql, (err) => {
            if (err) console.log(err);
            console.log("SpeedData inserted");
        });
    },

    async saveLastMinuteData(distance) {
        let insertSQL = "INSERT INTO data(distanceCM) values(" + distance + ");";
        await con.query(insertSQL, (err) => {
            if (err) console.log(err);
            console.log("I have inserted data to database!");
            return 200;
        });
    },

    async getDistanceToday() {
        let day = new Date().getDate();
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        let sql = "SELECT sum(distanceCM) as dis from data where time >='" + year + "-" + month + "-" + day + " 00:00:00';";
        //console.log(todaydistance);
        await con.query(sql, (err, res) => {
            if (err) console.log(err);
            if (res[0].dis != null) {
                let obj = new Object();
                obj.distancetoday = res[0].dis;
                return ({ status: 200, data: JSON.stringify(obj) });
            }
            else {
                let obj = new Object();
                obj.distancetoday = 0;
                return ({ status: 200, data: JSON.stringify(obj) });
            }
        });
    },

    async todayLineGraph() {
        let day = new Date().getDate();
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();
        //console.log(day + " " + month + " " + year);

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        let sql = "select hour(time) as hour,sum(distancecm) as distancecm from data where time>='" + year + "-" + month + "-" + day + " 00:00:00' group by hour(time);";

        //console.log(todaydistance);
        await con.query(sql, (err, res) => {
            if (err) console.log(err);
            let obj = [];
            res.forEach(element => {
                obj.push({ hour: element.hour + 1, distance: element.distancecm / 100.0 });
            });

            return { status: 200, data: JSON.stringify(obj) };
        });
    },

    async yesterdayLineGraph() {

        let today = new Date().getDate();
        let yesterday = new Date().getDate() - 1;
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();

        if (month < 10) month = "0" + month;
        if (today < 10) today = "0" + today;
        if (yesterday < 10) yesterday = "0" + yesterday;

        let todaydistance = "select hour(time) as hour,sum(distancecm) as distancecm from data where time between '" + year + "-" + month + "-" + yesterday + " 00:00:00' and '" + year + "-" + month + "-" + today + " 00:00:00' group by hour(time);";

        await con.query(todaydistance, (err, res) => {
            if (err) console.log(err);
            let obj = [];
            res.forEach(element => {
                obj.push({ hour: element.hour + 1, distance: element.distancecm / 100.0 });
            });
            console.log(obj);
            return { status: 200, data: JSON.stringify(obj) };
        });
    },

    async newDistanceGoal(data) {
        let type = data.type;
        let deploc = data.deploc;
        let desloc = data.desloc;
        let distance = data.distance;
        let remaining = data.distance;

        let insertSQL = "INSERT INTO DistanceGoals(type,DepLoc,DesLoc,distance,remaining) values(" + type + ",'" + deploc + "','" + desloc + "'," + distance + "," + remaining + ");";
        await con.query(insertSQL, (err) => {
            if (err) console.log(err);
            console.log("I have inserted new goal to database!");
            return 200;
        });
    },

    async getDistanceGoals() {
        let todaydistance = "SELECT id,(DATE_FORMAT(time, '%d.%m.%Y %H:%i')) as time,DepLoc,DesLoc,distance,remaining from DistanceGoals where done=0";
        //console.log(todaydistance);
        await con.query(todaydistance, (err, res) => {
            if (err) console.log(err);
            return res;
        });
    },
    async getChargingGoals() {
        let todaydistance = "SELECT id,device,(DATE_FORMAT(time, '%d.%m.%Y %H:%i')) as time,amount,remaining from ChargeGoals where done=0";
        //console.log(todaydistance);
        await con.query(todaydistance, (err, res) => {
            if (err) console.log(err);
            return res;
        });
    },

    async getTodayAwake() {
        let day = new Date().getDate();
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        let todayawake = "select count(id) as minutes from data where time >='" + year + "-" + month + "-" + day + " 00:00:00';";
        await con.query(todayawake, (err, res) => {
            if (err) console.log(err);
            let hours = new Date().getHours();
            let mins = new Date().getMinutes();
            let summins = (hours * 60) + mins;
            console.log(hours + " hodin " + mins + " minut =" + summins);
            let obj = new Object();
            obj.percentDone = Math.round(res[0].minutes * 100 / summins * 100) / 100;
            obj.percentTODO = 100 - obj.percentDone;
            obj.mins = res[0].minutes;
            obj.totalmins = summins;
            return JSON.stringify(obj);
        });
    },

    async getThisWeekAwake() {
        let day = new Date().getDate() - 7;
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        let todayawake = "select count(id) as minutes from data where time >='" + year + "-" + month + "-" + day + " 00:00:00';";
        await con.query(todayawake, (err, res) => {
            if (err) console.log(err);
            let hours = new Date().getHours() + 6 * 24;
            let mins = new Date().getMinutes();
            let summins = (hours * 60) + mins;
            console.log(hours + " hodin " + mins + " minut =" + summins);
            let obj = new Object();
            obj.percentDone = Math.round(res[0].minutes * 100 / summins * 100) / 100;
            obj.percentTODO = 100 - obj.percentDone;
            obj.mins = res[0].minutes;
            obj.totalmins = summins;
            return JSON.stringify(obj);
        });
    },

    async getThisMonthAwake() {
        let day = "01";
        let lastday = 31;
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        let todayawake = "select count(id) as minutes from data where time between '" + year + "-" + month + "-" + day + " 00:00:00' and '" + year + "-" + month + "-" + lastday + " 00:00:00';";
        await con.query(todayawake, (err, res) => {
            if (err) console.log(err);
            let hours = new Date().getHours() + 31 * 24;
            let mins = new Date().getMinutes();
            let summins = (hours * 60) + mins;
            console.log(hours + " hodin " + mins + " minut =" + summins);
            let obj = new Object();
            obj.percentDone = Math.round(res[0].minutes * 100 / summins * 100) / 100;
            obj.percentTODO = 100 - obj.percentDone;
            obj.mins = res[0].minutes;
            obj.totalmins = summins;
            return JSON.stringify(obj);
        });
    },

    async getTodayTopSpeed() {
        let day = new Date().getDate();
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        let topspeed = "select MAX(speed) as speed from speeds where time >='" + year + "-" + month + "-" + day + " 00:00:00';";
        await con.query(topspeed, async (err, res) => {
            if (err) console.log(err);
            let speed = res[0].speed;
            let toptime = "select (DATE_FORMAT(MIN(time), '%H:%i')) as time from speeds where time >='" + year + "-" + month + "-" + day + " 00:00:00' and speed=" + speed + ";"
            await con.query(toptime, (err, res) => {
                let obj = new Object();
                obj.speed = speed;
                obj.time = res[0].time;
                return JSON.stringify(obj);
            });

        });
    },

    async getWeekTopSpeed() {
        let day = new Date().getDate() - 7;
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        let topspeed = "select MAX(speed) as speed from speeds where time >='" + year + "-" + month + "-" + day + " 00:00:00';";

        await con.query(topspeed, async (err, res) => {
            if (err) console.log(err);
            let speed = res[0].speed;
            let toptime = "select (DATE_FORMAT(MIN(time), '%d.%m.%Y %H:%i')) as time from speeds where time >='" + year + "-" + month + "-" + day + " 00:00:00' and speed=" + speed + ";"
            await con.query(toptime, (err, res) => {
                let obj = new Object();
                obj.speed = speed;
                obj.time = res[0].time;
                return JSON.stringify(obj);
            });
        });
    },

    async getMonthTopSpeed() {
        let day = "01";
        let lastday = "31";
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        let topspeed = "select MAX(speed) as speed from speeds where time between '" + year + "-" + month + "-" + day + " 00:00:00' and '" + year + "-" + month + "-" + lastday + " 00:00:00';";

        await con.query(topspeed, async (err, res) => {
            if (err) console.log(err);
            let speed = res[0].speed;
            let toptime = "select (DATE_FORMAT(MIN(time), '%d.%m.%Y %H:%i')) as time from speeds where time between '" + year + "-" + month + "-" + day + " 00:00:00' and '" + year + "-" + month + "-" + lastday + " 00:00:00' and speed=" + speed + ";";
            await con.query(toptime, (err, res) => {
                let obj = new Object();
                obj.speed = speed;
                obj.time = res[0].time;
                return JSON.stringify(obj);
            });
        });
    },

    async getEnergyToday() {
        let day = new Date().getDate();
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        let todaydistance = "SELECT distancecm from data where time >='" + year + "-" + month + "-" + day + " 00:00:00';";

        await con.query(todaydistance, (err, res) => {
            if (err) console.log(err);
            if (res != null) {
                let obj = new Object();
                let count = 0;
                res.forEach(element => {
                    if (element.distancecm / 40 / 100 * 55.5 < 55.5) {
                        count = count + element.distancecm / 40 / 100 * 55.5;
                    }
                    else {
                        count = count + 55.5;
                    }
                });
                obj.entoday = Math.round(count * 100) / 100;
                return JSON.stringify(obj);
            }
            else {
                let obj = new Object();
                obj.entoday = 0.0;
                return JSON.stringify(obj);
            }
        });
    },

    async newChargeGoal() {
        let amount = req.body.amount;
        let device = req.body.device;

        let insertSQL = "INSERT INTO ChargeGoals(device,amount,remaining) values('" + device + "'," + amount + "," + amount + ");";
        await con.query(insertSQL, (err) => {
            if (err) console.log(err);
            console.log("I have inserted new charge goal to database!");
            return;
        });
    },

    async deleteDistanceGoal() {
        let todayawake = "DELETE from DistanceGoals where id=" + req.body.id;

        await con.query(todayawake, (err, res) => {
            if (err) console.log(err);
            return;
        });
    },

    async deleteChargingGoal() {
        let todayawake = "DELETE from ChargeGoals where id=" + req.body.id;
        await con.query(todayawake, (err, res) => {
            if (err) console.log(err);
            return;
        });
    },

    async getThisWeekLineGraph() {
        let day = new Date().getDate() - 7;
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        let todaydistance = "select day(time) as day,sum(distancecm) as distancecm from data where time>='" + year + "-" + month + "-" + day + " 00:00:00' group by day(time);";

        await con.query(todaydistance, (err, res) => {
            if (err) console.log(err);
            let obj = [];
            res.forEach(element => {
                obj.push({ day: element.day, distance: element.distancecm / 100.0 });
            });
            return JSON.stringify(obj);
        });
    },

    async getThisMonthLineGraph() {
        let day = "01";
        let lastday = 31;
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        let todaydistance = "select day(time) as day,sum(distancecm) as distancecm from data where time between '" + year + "-" + month + "-" + day + " 00:00:00' and '" + year + "-" + month + "-" + lastday + " 00:00:00' group by day(time);";

        await con.query(todaydistance, (err, res) => {
            if (err) console.log(err);
            let obj = [];
            res.forEach(element => {
                obj.push({ day: element.day, distance: element.distancecm / 100.0 });
            });
            return JSON.stringify(obj);
        });
    }
}