var production = true;
var backend = "";
if (production) {
    backend = "http://itsovy.sk:1206";
} else {
    backend = "http://localhost:1206";
}
let monthDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
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
            for (var i = 0; i < curr.day; i++) {
                zerosToAdd.push(0);
            }
        }
        let distanceSum = 0;
        for (const o in data) {
            distanceSum += data[o].distance;
            if (data[o].day === curr.day) {
                break;
            }
        }
        let countOfValuesToAdd = 1;
        if (index + 1 !== data.length)
            countOfValuesToAdd = data[index + 1].day - data[index].day;
        let toAdd = [];
        for (var i = 0; i < countOfValuesToAdd; i++) toAdd.push(distanceSum);

        return [...zerosToAdd, ...acc, ...toAdd];
    }, []);

const convertToday = data => {
    let day = new Date().getDate();
    const converted = convert(data);
    const valueToAdd = converted[converted.length - 1];
    let arrToAdd = [];
    for (var i = 0; i < day - data[data.length - 1].day; i++) {
        arrToAdd.push(valueToAdd);
    }
    return [...converted, ...arrToAdd];
}


function getLineGraph() {
    var result2;
    var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText != JSON.stringify([])) {
                result2 = convertToday(JSON.parse(this.responseText));
                renderGraph1(result2);
            }
            else {
                result2 = convertToday([{ hour: 0, distance: 0 }]);
                renderGraph1(result2);
            }
        };
    }
    xhttp2.open("GET", backend + "/thismonthlinegraph", true);
    xhttp2.send();


}

function createLabels() {
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();
    let days = new Date(year, month, 0).getDate();
    var array = [];
    for (i = 1; i <= days; i++) {
        array.push(i + ".");
    }
    return array;
}

function renderGraph1(data1) {
    var ctx = document.getElementById('distancegraph').getContext('2d');
    Chart.defaults.global.maintainAspectRatio = false;

    var chartdata = {
        type: 'line',
        data: {
            labels: [0, ...createLabels()],
            datasets: [{
                label: 'Total meters this month',
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
    fetch(backend + "/thismonthawake", {
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
    fetch(backend + "/monthtopspeed", {
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
    fetch(backend + "/thismonthlinegraph", {
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
            drawBarChart(convertBarMonth(response));
            drawactivitychart(convertActivityMonth(response));
        });
}




function drawBarChart(data) {
    Chart.defaults.global.maintainAspectRatio = false;
    var ctx = document.getElementById("barchart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: createLabels(),
            datasets: [{
                label: '# of meters a day',
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
            labels: createLabels(),
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


const convertBarMonth = (data) => {
    let array =[];
    for (i = 0; i < monthDays; i++) {
        array.push(0);
    }
    data.forEach(element => {
        array[element.day-1] = element.distance;
    });
    return array;
}

const convertActivityMonth = (data) => {
    let array =[];
    for (i = 0; i < monthDays; i++) {
        array.push(0);
    }
    data.forEach(element => {
        array[element.day-1] = 1;
    });
    return array;
}