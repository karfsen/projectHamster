function refresh(){
    getLineGraph();
    setTimeout(refresh,60000);
}
refresh();

const convert = data =>
data.reduce((acc, curr, index) => {
const zerosToAdd = [];
if(index === 0){
  for(var i = 0; i < curr.hour; i++){
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
    let hour=new Date().getHours();
    console.log(hour);
    const converted = convert(data);
    const valueToAdd = converted[converted.length - 1];
    let arrToAdd = [];
    for(var i = 0; i < hour - data[data.length -1].hour; i++){
      arrToAdd.push(valueToAdd);
    }
    return [...converted, ...arrToAdd];
  }

const convertNotToday = data => {
    const converted = convert(data);
    const valueToAdd = converted[converted.length - 1];
    let arrToAdd = [];
    for(var i = 0; i < 24 - data[data.length -1].hour; i++){
      arrToAdd.push(valueToAdd);
    }
    return [...converted, ...arrToAdd];
  }

    function getLineGraph(){
        var result;
        var result2;
        var xhttp = new XMLHttpRequest();
        var xhttp2 = new XMLHttpRequest();
        xhttp2.onreadystatechange = function() {
            console.log(this.responseText);
            if (this.readyState == 4 && this.status == 200) {
                console.log("133 riadok robim");
                if(this.responseText!=JSON.stringify([])){
                    console.log("135 robim");
                    result2=convertToday(JSON.parse(this.responseText));
                    console.log(result2);
                }
                else{
                    console.log("140 robim");
                    result2=convertToday([{hour:0,distance:0}]);
                    console.log(result2);
                }
            };
        }
        xhttp2.open("GET", "http://itsovy.sk:1206/todaylinegraph", true);
        xhttp2.send();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
                if(this.responseText!=JSON.stringify([])){
                    result=convertNotToday(JSON.parse(this.responseText));
                    console.log(result);
                }
                else{
                    result=convertNotToday([{hour:1,distance:0}]);
                    console.log(result);
                }
                
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
                labels: ['0:00','1:00','2:00','3:00','4:00','5:00','6:00','7:00','8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00','24:00'],
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