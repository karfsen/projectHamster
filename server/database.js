const mysql = require('mysql2');
const express = require('express');
const info = require("./secure-info.js");

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

    saveSpeed(event) {
        let sql = "INSERT INTO speeds values(id,CURRENT_TIMESTAMP," + 0.036 * event.speed + ");";
        con.query(sql, (err) => {
            if (err) console.log(err);
            console.log("SpeedData inserted");
            return;
        });
    },

    saveLastMinuteData(distance) {
        return new Promise((resolve, reject) => {
            let insertSQL = "INSERT INTO data(distanceCM) values(" + distance + ");";
            con.query(insertSQL, (err) => {
                if (err) reject(err);
                console.log("I have inserted data to database!");
                resolve();
            });
        });
    },

    getDistanceToday() {
        return new Promise((resolve, reject) => {
            let day = new Date().getDate();
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();

            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            let sql = "SELECT sum(distanceCM) as dis from data where time >='" + year + "-" + month + "-" + day + " 00:00:00';";
            //console.log(todaydistance);
            con.query(sql, (err, res) => {
                if (err) reject(err);
                if (res[0].dis != null) {
                    let obj = new Object();
                    obj.distancetoday = res[0].dis;
                    resolve({ data: JSON.stringify(obj) });
                }
                else {
                    let obj = new Object();
                    obj.distancetoday = 0;
                    resolve({ data: JSON.stringify(obj) });
                }
            });
        });
    },

    todayLineGraph() {
        return new Promise((resolve, reject) => {
            let day = new Date().getDate();
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();

            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            let sql = "select hour(time) as hour,sum(distancecm) as distancecm from data where time>='" + year + "-" + month + "-" + day + " 00:00:00' group by hour(time);";

            con.query(sql, (err, res) => {
                if (err) reject(err);
                let obj = [];
                res.forEach(element => {
                    obj.push({ hour: element.hour + 1, distance: element.distancecm / 100.0 });
                });

                resolve({ status: 200, data: JSON.stringify(obj) });
            });
        });
    },

    yesterdayLineGraph() {
        return new Promise((resolve, reject) => {
            let today = new Date().getDate();
            let yesterday = new Date().getDate() - 1;
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();

            if (month < 10) month = "0" + month;
            if (today < 10) today = "0" + today;
            if (yesterday < 10) yesterday = "0" + yesterday;

            let todaydistance = "select hour(time) as hour,sum(distancecm) as distancecm from data where time between '" + year + "-" + month + "-" + yesterday + " 00:00:00' and '" + year + "-" + month + "-" + today + " 00:00:00' group by hour(time);";

            con.query(todaydistance, (err, res) => {
                if (err) reject(err);
                let obj = [];
                res.forEach(element => {
                    obj.push({ hour: element.hour + 1, distance: element.distancecm / 100.0 });
                });
                console.log(obj);
                resolve({ status: 200, data: JSON.stringify(obj) });
            });
        });
    },

    newDistanceGoal(data) {
        return new Promise((resolve, reject) => {
            let type = data.type;
            let deploc = data.deploc;
            let desloc = data.desloc;
            let distance = data.distance;
            let remaining = data.distance;

            let insertSQL = "INSERT INTO DistanceGoals(type,DepLoc,DesLoc,distance,remaining) values(" + type + ",'" + deploc + "','" + desloc + "'," + distance + "," + remaining + ");";
            con.query(insertSQL, (err) => {
                if (err) reject(err);
                console.log("I have inserted new goal to database!");
                resolve();
            });
        });
    },

    getDistanceGoals() {
        return new Promise((resolve, reject) => {
            let todaydistance = "SELECT id,(DATE_FORMAT(time, '%d.%m.%Y %H:%i')) as time,DepLoc,DesLoc,distance,remaining from DistanceGoals where done=0";
            //console.log(todaydistance);
            con.query(todaydistance, (err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        });
    },

    getChargingGoals() {
        return new Promise((resolve, reject) => {
            let todaydistance = "SELECT id,device,(DATE_FORMAT(time, '%d.%m.%Y %H:%i')) as time,amount,remaining from ChargeGoals where done=0";
            //console.log(todaydistance);
            con.query(todaydistance, (err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        });
    },

    getTodayAwake() {
        return new Promise((resolve, reject) => {
            let day = new Date().getDate();
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();

            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            let todayawake = "select count(id) as minutes from data where time >='" + year + "-" + month + "-" + day + " 00:00:00';";
            con.query(todayawake, (err, res) => {
                if (err) reject(err);
                let hours = new Date().getHours();
                let mins = new Date().getMinutes();
                let summins = (hours * 60) + mins;
                let obj = new Object();
                obj.percentDone = Math.round(res[0].minutes * 100 / summins * 100) / 100;
                obj.percentTODO = 100 - obj.percentDone;
                obj.mins = res[0].minutes;
                obj.totalmins = summins;
                resolve(JSON.stringify(obj));
            });
        });
    },

    getThisWeekAwake() {
        return new Promise((resolve, reject) => {
            let day = new Date().getDate() - 7;
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();

            if(day < 1){
                month--;
                var days = function(month,year) {
                    return new Date(year, month, 0).getDate();
                };
                day = days(month,year);
            }
            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            let todayawake = "select count(id) as minutes from data where time >='" + year + "-" + month + "-" + day + " 00:00:00';";
            con.query(todayawake, (err, res) => {
                if (err) reject(err);
                let hours = new Date().getHours() + 6 * 24;
                let mins = new Date().getMinutes();
                let summins = (hours * 60) + mins;
                let obj = new Object();
                obj.percentDone = Math.round(res[0].minutes * 100 / summins * 100) / 100;
                obj.percentTODO = 100 - obj.percentDone;
                obj.mins = res[0].minutes;
                obj.totalmins = summins;
                resolve(JSON.stringify(obj));
            });
        });
    },

    getThisMonthAwake() {
        return new Promise((resolve, reject) => {
            let day = "01";
            let lastday = 31;
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();

            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            let todayawake = "select count(id) as minutes from data where time between '" + year + "-" + month + "-" + day + " 00:00:00' and '" + year + "-" + month + "-" + lastday + " 00:00:00';";
            con.query(todayawake, (err, res) => {
                if (err) reject(err);
                let hours = new Date().getHours() + 31 * 24;
                let mins = new Date().getMinutes();
                let summins = (hours * 60) + mins;
                let obj = new Object();
                obj.percentDone = Math.round(res[0].minutes * 100 / summins * 100) / 100;
                obj.percentTODO = 100 - obj.percentDone;
                obj.mins = res[0].minutes;
                obj.totalmins = summins;
                resolve(JSON.stringify(obj));
            });
        });
    },

    getTodayTopSpeed() {
        return new Promise((resolve, reject) => {
            let day = new Date().getDate();
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();

            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            let topspeed = "select MAX(speed) as speed from speeds where time >='" + year + "-" + month + "-" + day + " 00:00:00';";
            con.query(topspeed, async (err, res) => {
                if (err) reject(err);
                let speed = res[0].speed;
                let toptime = "select (DATE_FORMAT(MIN(time), '%H:%i')) as time from speeds where time >='" + year + "-" + month + "-" + day + " 00:00:00' and speed=" + speed + ";"
                con.query(toptime, (err, res) => {
                    let obj = new Object();
                    obj.speed = speed;
                    obj.time = res[0].time;
                    resolve(JSON.stringify(obj));
                });
            });
        });
    },

    getWeekTopSpeed() {
        return new Promise((resolve, reject) => {
            let day = new Date().getDate() - 7;
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();
            
            if(day < 1){
                month--;
                var days = function(month,year) {
                    return new Date(year, month, 0).getDate();
                };
                day = days(month,year);
            }
            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            let topspeed = "select MAX(speed) as speed from speeds where time >='" + year + "-" + month + "-" + day + " 00:00:00';";

            con.query(topspeed, async (err, res) => {
                if (err) reject(err);
                let speed = res[0].speed;
                let toptime = "select (DATE_FORMAT(MIN(time), '%d.%m.%Y %H:%i')) as time from speeds where time >='" + year + "-" + month + "-" + day + " 00:00:00' and speed=" + speed + ";"
                con.query(toptime, (err, res) => {
                    let obj = new Object();
                    obj.speed = speed;
                    obj.time = res[0].time;
                    resolve(JSON.stringify(obj));
                });
            });
        });
    },

    getMonthTopSpeed() {
        return new Promise((resolve, reject) => {
            let day = "01";
            let lastday = "31";
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();

            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            let topspeed = "select MAX(speed) as speed from speeds where time between '" + year + "-" + month + "-" + day + " 00:00:00' and '" + year + "-" + month + "-" + lastday + " 00:00:00';";

            con.query(topspeed, async (err, res) => {
                if (err) reject(err);
                let speed = res[0].speed;
                let toptime = "select (DATE_FORMAT(MIN(time), '%d.%m.%Y %H:%i')) as time from speeds where time between '" + year + "-" + month + "-" + day + " 00:00:00' and '" + year + "-" + month + "-" + lastday + " 00:00:00' and speed=" + speed + ";";
                con.query(toptime, (err, res) => {
                    let obj = new Object();
                    obj.speed = speed;
                    obj.time = res[0].time;
                    resolve(JSON.stringify(obj));
                });
            });
        });
    },

    getEnergyToday() {
        return new Promise((resolve, reject) => {
            let day = new Date().getDate();
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();

            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            let todaydistance = "SELECT distancecm from data where time >='" + year + "-" + month + "-" + day + " 00:00:00';";

            con.query(todaydistance, (err, res) => {
                if (err) reject(err);
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
                    resolve(JSON.stringify(obj));
                }
                else {
                    let obj = new Object();
                    obj.entoday = 0.0;
                    resolve(JSON.stringify(obj));
                }
            });
        });
    },

    newChargeGoal(data) {
        return new Promise((resolve, reject) => {
            let amount = data.amount;
            let device = data.device;

            let insertSQL = "INSERT INTO ChargeGoals(device,amount,remaining) values('" + device + "'," + amount + "," + amount + ");";
            con.query(insertSQL, (err) => {
                if (err) reject(err);
                console.log("I have inserted new charge goal to database!");
                resolve();
            });
        });
    },

    deleteDistanceGoal(id) {
        return new Promise((resolve, reject) => {
            let todayawake = "DELETE from DistanceGoals where id=" + id;

            con.query(todayawake, (err, res) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    deleteChargingGoal(id) {
        return new Promise((resolve, reject) => {
            let todayawake = "DELETE from ChargeGoals where id=" + id;
            con.query(todayawake, (err, res) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    getThisWeekLineGraph() {
        return new Promise((resolve, reject) => {
            let day = new Date().getDate() - 7;
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();

            if(day < 1){
                month--;
                var days = function(month,year) {
                    return new Date(year, month, 0).getDate();
                };
                day = days(month,year);
            }
            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            let todaydistance = "select day(time) as day,sum(distancecm) as distancecm from data where time>='" + year + "-" + month + "-" + day + " 00:00:00' group by day(time);";
            console.log(todaydistance);
            con.query(todaydistance, (err, res) => {
                if (err) reject(err);
                let obj = [];
                console.log(res);
                res.forEach(element => {
                    obj.push({ day: element.day, distance: element.distancecm / 100.0 });
                });
                resolve(JSON.stringify(obj));
            });
        });
    },

    getThisMonthLineGraph() {
        return new Promise((resolve, reject) => {
            let day = "01";
            let lastday = 31;
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();

            if(day < 1){
                month--;
                var days = function(month,year) {
                    return new Date(year, month, 0).getDate();
                };
                day = days(month,year);
            }
            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            let todaydistance = "select day(time) as day,sum(distancecm) as distancecm from data where time between '" + year + "-" + month + "-" + day + " 00:00:00' and '" + year + "-" + month + "-" + lastday + " 00:00:00' group by day(time);";

            con.query(todaydistance, (err, res) => {
                if (err) reject(err);
                let obj = [];
                res.forEach(element => {
                    obj.push({ day: element.day, distance: element.distancecm / 100.0 });
                });
                resolve(JSON.stringify(obj));
            });
        });
    }
}