var backend = "http://itsovy.sk:1206";

let todayDateDay = new Date().getDate();
function refresh() {
    getLineGraph();
    drawChart();
    getTodayTopSpeed();
    getBarChart();
    getUpdateTime();
    todayDateDay = new Date().getDate();
    setTimeout(refresh, 60000);
}
refresh();

const convertToday = (data) => {
    let array =[];
    let firstDay = todayDateDay - 6;
    for (i = 0; i < 7; i++) {
        array.push(0);
    }
    let total = 0;
    data.forEach(element => {  
    	total+=element.distance;
        array[element.day-firstDay-1] = total;
    });
    console.log(array)
    return array;
}


function getLineGraph() {
    var result2;
    var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function () {
        console.log(this.responseText);
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
    xhttp2.open("GET", backend + "/thisweeklinegraph", true);
    xhttp2.send();


}


function renderGraph1(data1) {
    var ctx = document.getElementById('distancegraph').getContext('2d');
    Chart.defaults.global.maintainAspectRatio = false;

    var chartdata = {
        type: 'line',
        data: {
            labels: [todayDateDay - 6 + ".", todayDateDay - 5 + ".", todayDateDay - 4 + ".", todayDateDay - 3 + ".", todayDateDay - 2 + ".", todayDateDay - 1 + ".", todayDateDay + "."],
            datasets: [{
                label: 'Total meters this week',
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
                data: [0,...data1]
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
    fetch(backend + "/thisweekawake", {
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
            console.log(dataset);
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
    fetch(backend + "/weektopspeed", {
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
    fetch(backend + "/thisweeklinegraph", {
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
            drawBarChart(convertBarWeek(response));
            drawactivitychart(convertActivityWeek(response));
        });
}




function drawBarChart(data) {
    Chart.defaults.global.maintainAspectRatio = false;
    var ctx = document.getElementById("barchart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [todayDateDay - 6 + ".",todayDateDay - 5 + ".", todayDateDay - 4 + ".", todayDateDay - 3 + ".", todayDateDay - 2 + ".", todayDateDay - 1 + ".", todayDateDay + "."],
            datasets: [{
                label: '# of meters a day',
                data: data,
                backgroundColor: ['rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)'
                ],
                borderColor: ['rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)'
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
            labels: [todayDateDay - 6 + ".", todayDateDay - 5 + ".", todayDateDay - 4 + ".", todayDateDay - 3 + ".", todayDateDay - 2 + ".", todayDateDay - 1 + ".", todayDateDay + "."],
            datasets: [{
                label: 'Active',
                data: data,
                backgroundColor: ['rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)'
                ],
                borderColor: ['rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)',
                    'rgba(7,0,255,1)'
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
                    min: 1,
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


const convertBarWeek = (data) => {
    let array =[];
    for (i = 0; i < 7; i++) {
        array.push(0);
    }
    let firstDay = todayDateDay - 6;
    data.forEach(element => {
        if(element.day - firstDay < 0){

        }else{
            array[element.day-firstDay] = element.distance;
        }
    });
    return array;
}

const convertActivityWeek = (data) => {
    let array =[];
    let firstDay = todayDateDay - 6;
    for (i = 0; i < 7; i++) {
        array.push(0);
    }
    data.forEach(element => {        
        array[element.day-firstDay] = 1;
    });
    return array;
}