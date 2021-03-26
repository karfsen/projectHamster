var production = true;
var backend = "";
if (production) {
    backend = "http://itsovy.sk:1206";
} else {
    backend = "http://localhost:1206";
}
function refresh() {
    getLineGraph();
    drawChart();
    getTodayTopSpeed();
    getBarChart();
    getUpdateTime();
    setTimeout(refresh, 60000);
}
refresh();

const convert = data =>
    data.reduce((acc, curr, index) => {
        const zerosToAdd = [];
        if (index === 0) {
            for (var i = 0; i < curr.hour; i++) {
                zerosToAdd.push(0);
            }
        }
        let distanceSum = 0;
        for (const o in data) {
            distanceSum += data[o].distance;
            if (data[o].hour === curr.hour) {
                break;
            }
        }
        let countOfValuesToAdd = 1;
        if (index + 1 !== data.length)
            countOfValuesToAdd = data[index + 1].hour - data[index].hour;
        let toAdd = [];
        for (var i = 0; i < countOfValuesToAdd; i++) toAdd.push(distanceSum);

        return [...zerosToAdd, ...acc, ...toAdd];
    }, []);

const convertToday = data => {
    let hour = new Date().getHours();
    console.log(hour);
    const converted = convert(data);
    const valueToAdd = converted[converted.length - 1];
    let arrToAdd = [];
    for (var i = 0; i < hour - data[data.length - 1].hour; i++) {
        arrToAdd.push(valueToAdd);
    }
    return [...converted, ...arrToAdd];
}

const convertNotToday = data => {
    const converted = convert(data);
    const valueToAdd = converted[converted.length - 1];
    let arrToAdd = [];
    for (var i = 0; i < 24 - data[data.length - 1].hour; i++) {
        arrToAdd.push(valueToAdd);
    }
    return [...converted, ...arrToAdd];
}

function getLineGraph() {
    var result;
    var result2;
    var xhttp = new XMLHttpRequest();
    var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function () {
        console.log(this.responseText);
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText != JSON.stringify([])) {
                result2 = convertToday(JSON.parse(this.responseText));
                console.log(result2);
            }
            else {
                result2 = convertToday([{ hour: 0, distance: 0 }]);
                console.log(result2);
            }
        };
    }
    xhttp2.open("GET", backend + "/todaylinegraph", true);
    xhttp2.send();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText != JSON.stringify([])) {
                result = convertNotToday(JSON.parse(this.responseText));
            }
            else {
                result = convertNotToday([{ hour: 1, distance: 0 }]);
            }

            setTimeout(() => {
                renderGraph1(result2, result);
            }, 50);
        }
    };
    xhttp.open("GET", backend + "/yesterdaylinegraph", true);
    xhttp.send();
}


function renderGraph1(data1, data2) {
    var ctx = document.getElementById('distancegraph').getContext('2d');
    Chart.defaults.global.maintainAspectRatio = false;

    var chartdata = {
        type: 'line',
        data: {
            labels: ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'],
            datasets: [{
                label: 'Total meters today',
                fill: false,
                lineTension: 0.1,
                borderWidth: 1,
                backgroundColor: 'rgba(0,0,255)',
                borderColor: 'rgba(0,0,255)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(0,0,255)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(0,0,255)',
                pointHoverBorderColor: 'rgba(0,0,255)',
                pointHoverBorderWidth: 0.5,
                pointRadius: 0.1,
                pointHitRadius: 10,
                data: data1
            }]
        },
        options: {
            responsive: true,
            legend: {
                position: 'right'
            }
        }
    };

    var Chart1 = new Chart(ctx, chartdata);

}


function drawChart() {
    let dataset;
    fetch(backend + "/todayawake", {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrer: 'no-referrer'
    }).then(response => response.json())

        .then(response => {
            console.log(response);
            let bigmins = response.mins;
            let bigtotalmins = response.totalmins - bigmins;
            if (bigtotalmins > 59) {
                let hours = Math.trunc(bigtotalmins / 60);
                bigtotalmins = bigtotalmins - (hours * 60);
                document.getElementById("sleepMins").innerHTML = hours + " hours " + bigtotalmins + " minutes";
            }
            else {
                document.getElementById("sleepMins").innerHTML = bigtotalmins + " minutes";
            }

            if (bigmins > 59) {
                let hours = Math.trunc(bigmins / 60);
                bigmins = bigmins - (hours * 60);
                document.getElementById("doneMins").innerHTML = hours + " hours " + bigmins + " minutes";
            }
            else {
                document.getElementById("doneMins").innerHTML = bigmins + " minutes";
            }
            if (response.percentDone == null || response.percentTODO == null) {
                dataset = [0, 100];
            }
            else {
                dataset = [response.percentDone, response.percentTODO];
            }
            let options = {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: dataset,
                        backgroundColor: [
                            "#0700ff",
                            "#979797"
                        ],
                    }],
                    labels: [
                        "AWAKE",
                        "SLEEP"
                    ]
                },
                options: {
                    legend: {
                        display: false
                    },
                    responsive: true
                }
            };
            var ctx = document.getElementById("awake").getContext('2d');
            var myDoughnutChart = new Chart(ctx, options);
        });
}

function getTodayTopSpeed() {
    fetch(backend + "/todaytopspeed", {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrer: 'no-referrer'
    })
        .then(response => response.json())
        .then(response => {
            let speed;
            let time;
            if (response.speed == null) {
                speed = 0;
                time = "Wait for hamster to run!";
            }
            else {
                speed = response.speed;
                time = response.time;
            }
            document.getElementById("number").innerHTML = Math.round(speed * 100) / 100;
            document.getElementById("timeTopSpeed").innerHTML = time;
        });
}

function getBarChart() {
    fetch(backend + "/todaylinegraph", {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrer: 'no-referrer'
    })
        .then(response => response.json())
        .then(response => {
            drawBarChart(convertBar(response));
            drawactivitychart(convertActivity(response));
        });
}




function drawBarChart(data) {
    Chart.defaults.global.maintainAspectRatio = false;
    var ctx = document.getElementById("barchart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
            datasets: [{
                label: '# of meters a hour',
                data: data,
                backgroundColor: ['rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                ],
                borderColor: ['rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                xAxes: [{
                    ticks: {
                        maxRotation: 90,
                        minRotation: 80
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}



function drawactivitychart(data) {
    Chart.defaults.global.maintainAspectRatio = false;
    var ctx = document.getElementById("activitygraph").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
            datasets: [{
                label: 'Active',
                data: data,
                backgroundColor: ['rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                ],
                borderColor: ['rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                xAxes: [{
                    categoryPercentage: 1,
                    barPercentage: 1
                }]
            },
            yAxes: [{
                ticks: {
                    max: 1,
                    min: 0,
                    stepSize: 1
                }
            }]
        }
    });
}

function getUpdateTime() {
    var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let rslt = JSON.parse(this.responseText);
            document.getElementById("updateData").innerHTML = "Last data update " + rslt.date;
        };
    }
    xhttp2.open("GET", backend + "/getupdatetime", true);
    xhttp2.send();
}


const convertBar = (data) => {
    let array =[];
    for (i = 0; i < 25; i++) {
        array.push(0);
    }
    data.forEach(element => {
        array[element.hour-1] = element.distance;
    });
    return array;
}

const convertActivity = (data) => {
    let array =[];
    for (i = 0; i < 25; i++) {
        array.push(0);
    }
    data.forEach(element => {
        array[element.hour-1] = 1;
    });
    return array;
}