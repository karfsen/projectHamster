/////////////////////////MAIN PAGE/////////////////////////////////////
/*if(window.innerWidth<768){
    document.getElementsByClassName("s1").style.visibility="hidden";
    document.getElementById("s2").style.visibility="hidden";
    document.getElementById("s3").style.visibility="hidden";
    document.getElementById("burger").style.visibility="visible";
}*/
const socket = io.connect('http://itsovy.sk:1206');
emit();
refresh();
var angle=0;

function emit(){
    socket.emit('getdata');
    setTimeout(emit,300);
}


socket.on('connect', (data) => {
	    console.log('check',socket.connected);
	    //socket.emit('weatherData');
	    socket.emit('getdata');
	    console.log(data);
});
socket.on('data',(data)=>{
    console.log(data);
    document.getElementById("tempo").innerHTML=data.speed+" km/h";
    angle += data.speed*20;
    $("#wheelimg").css('transform','rotate('+angle+'deg)');
});


function refresh(){
    getLineGraph();
    getTodayDistance();
    getTodayEnergy();
    getUpdateTime();
    setTimeout(refresh,60000);
}

 const convert = data =>
    data.reduce((acc, curr, index) => {
    let distanceSum = 0;
    for (const o in data) {
         distanceSum += data[o].distancecm;
        if (data[o].hour === curr.hour) {
            break;
        }
    }
    let countOfValuesToAdd = 1;
    if (index + 1 !== data.length)
        countOfValuesToAdd = data[index + 1].hour - data[index].hour;
        let toAdd = [];
        for (var i = 0; i < countOfValuesToAdd; i++) toAdd.push(distanceSum);
        if (index === 0) {
            return [0, ...acc, ...toAdd];
        }
        return [...acc, ...toAdd];
    }, []);

    function getLineGraph(){
        var result;
        var result2;
        var xhttp = new XMLHttpRequest();
        var xhttp2 = new XMLHttpRequest();
        xhttp2.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                    result2=convert(JSON.parse(this.responseText));
                    console.log(result2);
                };
            }
        xhttp2.open("GET", "http://itsovy.sk:1206/todaylinegraph", true);
        xhttp2.send();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                result=convert(JSON.parse(this.responseText));
                console.log(result);
                setTimeout(() => {
                    renderGraph1(result2,result);
                }, 50);
            }
        };
        xhttp.open("GET", "http://itsovy.sk:1206/yesterdaylinegraph", true);
        xhttp.send();
    }


    function renderGraph1(data1,data2) {
        var ctx = document.getElementById('distancegraph').getContext('2d');		
        Chart.defaults.global.maintainAspectRatio = false;
        
        var chartdata={
            type: 'line',
            data: {
                labels: ['0:00','1:00','2:00','3:00','4:00','5:00','6:00','7:00','8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'],
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
                    },
                    {
                    label: 'Yesterday',
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: 'rgba(151, 151, 151)',
                    borderColor: 'rgba(151, 151, 151)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderWidth:1,
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(151, 151, 151)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(151, 151, 151)',
                    pointHoverBorderColor: 'rgba(151, 151, 151)',
                    pointHoverBorderWidth: 0.5,
                    pointRadius: 0.1,
                    pointHitRadius: 1,
                    data: data2
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

    function getUpdateTime(){
        var xhttp2 = new XMLHttpRequest();
        xhttp2.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let rslt=JSON.parse(this.responseText);
                    document.getElementById("time").innerHTML="Last data update "+rslt.date;
                };
            }
        xhttp2.open("GET", "http://itsovy.sk:1206/getupdatetime", true);
        xhttp2.send();
    }

    function getTodayEnergy(){
        var xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let res=JSON.parse(this.responseText);
                console.log(res);
                document.getElementById("todayen").innerHTML=res.entoday+'<div class="unit">mAh</div>';
            }
        };
        xhttp.open("GET", "http://itsovy.sk:1206/energytoday", true);
        xhttp.send();
    }

    function getTodayDistance(){
        var xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let res=JSON.parse(this.responseText);
                document.getElementById("todaydis").innerHTML=res.distancetoday/100.0+'<div class="unit">m</div>';
            }
        };
        xhttp.open("GET", "http://itsovy.sk:1206/distancetoday", true);
        xhttp.send();
    }



