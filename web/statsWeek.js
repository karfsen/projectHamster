var production=false;
var backend="";
if(production){
    backend="http://itsovy.sk:1206";
}else{
    backend="http://localhost:1206";
}
function refresh(){
    getLineGraph();
    drawChart();
    getTodayTopSpeed();
    getBarChart();
    getUpdateTime();
    setTimeout(refresh,60000);
}
refresh();

const convert = data =>
data.reduce((acc, curr, index) => {
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
    
    return [...acc, ...toAdd];
}, []);

const convertToday = data => {
    let hour=new Date().getDay();
    //console.log(hour);
    const converted = convert(data);
    console.log(converted);
    const valueToAdd = converted[converted.length - 1];
    let arrToAdd = [];
    for(var i = 0; i < hour - data[data.length -1].day; i++){
      arrToAdd.push(valueToAdd);
    }
    return [...converted, ...arrToAdd];
}


function getLineGraph(){
    var result2;
    var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function() {
        console.log(this.responseText);
        if (this.readyState == 4 && this.status == 200) {
            console.log("133 riadok robim");
            if(this.responseText!=JSON.stringify([])){
                //console.log("135 robim");
                result2=convertToday(JSON.parse(this.responseText));
                //console.log(result2);
                renderGraph1(result2);

            }
            else{
                //console.log("140 robim");
                result2=convertToday([{hour:0,distance:0}]);
                //console.log(result2);
                renderGraph1(result2);
            }
        };
    }
    xhttp2.open("GET", backend+"/thisweeklinegraph", true);
    xhttp2.send();

    
}


function renderGraph1(data1) {
    var ctx = document.getElementById('distancegraph').getContext('2d');		
    Chart.defaults.global.maintainAspectRatio = false;
    
    var chartdata={
        type: 'line',
        data: {
            labels: [new Date().getDate()-6+".",new Date().getDate()-5+".",new Date().getDate()-4+".",new Date().getDate()-3+".",new Date().getDate()-2+".",new Date().getDate()-1+".",new Date().getDate()+"."],
            datasets: [{
                label: 'Today',
                fill: false,
                lineTension: 0.1,
                borderWidth:1,
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
                data:data1
                }]
        },
        options: {
            responsive:true,
            legend:{
                position:'right'
            }
        }
    };

    var Chart1 = new Chart(ctx, chartdata);

}


function drawChart() {
    let dataset;
    fetch(backend+"/thisweekawake",{
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
    .then(response=>response.json())
    .then(response=>{
        console.log(response);
        let bigmins=response.mins;
        let bigtotalmins=response.totalmins-bigmins;
        if(bigtotalmins>59){ 
            let hours=Math.trunc(bigtotalmins/60);
            console.log("Before "+bigtotalmins);
            bigtotalmins=bigtotalmins-(hours*60);
            console.log("After"+bigtotalmins);
            document.getElementById("sleepMins").innerHTML=hours+" hours "+bigtotalmins+" minutes";
        }
        else{
            document.getElementById("sleepMins").innerHTML=bigtotalmins+" minutes";
        }

        if(bigmins>59){
            let hours=Math.trunc(bigmins/60);
            bigmins=bigmins-(hours*60);
            document.getElementById("doneMins").innerHTML=hours+" hours "+bigmins+" minutes";
        }
        else{
            document.getElementById("doneMins").innerHTML=bigmins+" minutes";
        }
        if(response.percentDone==null|| response.percentTODO==null){
            dataset=[0,100];
        }
        else{
            dataset=[response.percentDone,response.percentTODO];
        }
        console.log(dataset);
        let options= {
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
        var myDoughnutChart = new Chart(ctx,options);
    });  
}

function getTodayTopSpeed(){
    fetch(backend+"/weektopspeed",{
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
    .then(response=>response.json())
    .then(response=>{
        let speed;
        let time;
        if(response.speed==null){
            speed=0;
            time="Wait for hamster to run!";
        }
        else{
            speed=response.speed;
            time=response.time;
        }
        document.getElementById("number").innerHTML=Math.round(speed*100)/100;
        document.getElementById("timeTopSpeed").innerHTML=time;
    });
}

function getBarChart(){
    fetch(backend+"/thisweeklinegraph",{
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
    .then(response=>response.json())
    .then(response=>{
        //let hodnoty=convertBar(response);
        //console.log(hodnoty);
        drawBarChart(convertBar(response));
        drawactivitychart(convertActivity(response));
        //console.log(convertBar(response));
        //console.log(convertActivity(response));

    });
}




function drawBarChart(data){
    Chart.defaults.global.maintainAspectRatio = false;
    var ctx = document.getElementById("barchart").getContext('2d');
    var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [new Date().getDate()-6+".",new Date().getDate()-5+".",new Date().getDate()-4+".",new Date().getDate()-3+".",new Date().getDate()-2+".",new Date().getDate()-1+".",new Date().getDate()+"."],
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



function drawactivitychart(data){
    Chart.defaults.global.maintainAspectRatio = false;
    var ctx = document.getElementById("activitygraph").getContext('2d');
    var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [new Date().getDate()-6+".",new Date().getDate()-5+".",new Date().getDate()-4+".",new Date().getDate()-3+".",new Date().getDate()-2+".",new Date().getDate()-1+".",new Date().getDate()+"."],
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
            beginAtZero: true
            }
        }]
        }
    });
}

function getUpdateTime(){
    var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let rslt=JSON.parse(this.responseText);
                document.getElementById("updateData").innerHTML="Last data update "+rslt.date;
            };
        }
    xhttp2.open("GET", backend+"/getupdatetime", true);
    xhttp2.send();
}

let i = 0;
const convertBar = (data) => data.reduce((acc, {distance})=>{
    let zerosToAdd = 0;
    if(data[i+1]){
        zerosToAdd = data[i+1].hour-data[i].day
    }else{
        zerosToAdd = 31 - data[i].day
    }
    let zeros = [];
    for(let k = 0; k < zerosToAdd -1; k++){
        zeros.push(0);
    }
    i++;
    return [...acc, distance, ...zeros]
}, []);

let j = 0;
const convertActivity = (data) => data.reduce((acc, {distance})=>{
    let zerosToAdd = 0;
    if(data[j+1]){
        zerosToAdd = data[j+1].hour-data[j].hour
    }else{
        zerosToAdd = 24 - data[j].hour
    }
    let zeros = [];
    for(let j = 1; j < zerosToAdd; j++){
        zeros.push(0);
    }
    j++;
    return [...acc, 1, ...zeros]
}, []);