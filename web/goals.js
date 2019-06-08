showAllGoals();
chargoalSelected=null;
function drawChart(id,done,todo) {

  let data=[done,todo];

  console.log(data);
  let options= {
    type: 'doughnut',
    data: {
        datasets: [{
            data: data,
            backgroundColor: [
                "#0700ff",
                "#979797"
            ],
        }],
        labels: [
            "DONE",
            "TODO"
        ]
    },
    options: {
        responsive: true
    }
};
  var ctx = document.getElementById(id).getContext('2d');

  var myDoughnutChart = new Chart(ctx,options);
  return myDoughnutChart;

}


//////////////////////////////Functions for modal while creating new goal/////////////////////////
var modal = document.getElementById("myModal");
var logo=document.getElementsByClassName("Group")[0];
// Get the button that opens the modal
var btn = document.getElementById("button");


var span = document.getElementById("x");



btn.onclick = function() {
  modal.style.display = "block";
  logo.style.display="none";
}


function close() {
  document.getElementById("step2dis").style.display="none";
  document.getElementById("step2char").style.display="none";
  document.getElementById("step1").style.display="block";
  document.getElementById("deleteGoal").style.display="none";
  modal.style.display = "none";
  logo.style.display="block";
  selectedGoal=0;
  document.getElementsByClassName("disGoalBox")[0].style.backgroundColor="#ffffff";
  document.getElementsByClassName("charGoalBox")[0].style.backgroundColor="#ffffff";
  document.getElementById("svg1").style.fill="#979797";
  document.getElementById("disq").style.color="#979797";
  document.getElementById("svg2").style.fill="#979797";
  document.getElementById("charq").style.color="#979797";
  document.getElementById("nextB").disabled=true;
  document.getElementById("nextB").style.backgroundColor="979797";
  document.getElementsByClassName("disGoalBox")[0].onmouseover="overDisGoal()";
  document.getElementsByClassName("charGoalBox")[0].onmouseover="overCharGoal()";
  document.getElementsByClassName("disGoalBox")[0].onmouseout="outDisGoal()";
  document.getElementsByClassName("charGoalBox")[0].onmouseout="outCharGoal()";
  console.log("volam close");
}

window.onclick = function(event) {
  if (event.target == modal) {
    document.getElementById("step2dis").style.display="none";
    document.getElementById("step2char").style.display="none";
    document.getElementById("step1").style.display="block";
    document.getElementById("deleteGoal").style.display="none";
    modal.style.display = "none";
    logo.style.display="block";
    selectedGoal=0;
    document.getElementsByClassName("disGoalBox")[0].style.backgroundColor="#ffffff";
    document.getElementsByClassName("charGoalBox")[0].style.backgroundColor="#ffffff";
    document.getElementById("svg1").style.fill="#979797";
    document.getElementById("disq").style.color="#979797";
    document.getElementById("svg2").style.fill="#979797";
    document.getElementById("charq").style.color="#979797";
    document.getElementById("nextB").disabled=true;
    document.getElementById("nextB").style.backgroundColor="979797";
    document.getElementsByClassName("disGoalBox")[0].onmouseover="overDisGoal()";
    document.getElementsByClassName("charGoalBox")[0].onmouseover="overCharGoal()";
    document.getElementsByClassName("disGoalBox")[0].onmouseout="outDisGoal()";
    document.getElementsByClassName("charGoalBox")[0].onmouseout="outCharGoal()";
    console.log("volam close");
  }
}


let selectedGoal=null;

ondisGoalSelected=function(){
  document.getElementsByClassName("disGoalBox")[0].style.backgroundColor="#0700ff";
  document.getElementsByClassName("charGoalBox")[0].style.backgroundColor="#ffffff";
  document.getElementById("svg1").style.fill="#FFFFFF";
  document.getElementById("disq").style.color="#FFFFFF";
  document.getElementById("svg2").style.fill="#979797";
  document.getElementById("charq").style.color="#979797";
  document.getElementById("nextB").disabled=false;
  document.getElementById("nextB").style.backgroundColor="#0700ff";
  document.getElementsByClassName("disGoalBox")[0].onmouseover="";
  document.getElementsByClassName("charGoalBox")[0].onmouseover="overCharGoal()";
  document.getElementsByClassName("disGoalBox")[0].onmouseout="";
  document.getElementsByClassName("charGoalBox")[0].onmouseout="outCharGoal()";
  selectedGoal=1;
}

oncharGoalSelected=function(){
  document.getElementsByClassName("disGoalBox")[0].style.backgroundColor="#ffffff";
  document.getElementsByClassName("charGoalBox")[0].style.backgroundColor="#0700ff";
  document.getElementById("svg1").style.fill="#979797";
  document.getElementById("disq").style.color="#979797";
  document.getElementById("svg2").style.fill="#ffffff";
  document.getElementById("charq").style.color="#ffffff";
  document.getElementById("nextB").disabled=false;
  document.getElementById("nextB").style.backgroundColor="#0700ff";
  document.getElementsByClassName("disGoalBox")[0].onmouseover="overDisGoal()";
  document.getElementsByClassName("charGoalBox")[0].onmouseover="";
  document.getElementsByClassName("disGoalBox")[0].onmouseout="outDisGoal()";
  document.getElementsByClassName("charGoalBox")[0].onmouseout="";
  selectedGoal=2;
}

overDisGoal=function(){
  document.getElementsByClassName("disGoalBox")[0].style.boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.15)";
  document.getElementById("svg1").style.fill="#0700ff";
  document.getElementById("disq").style.color="#0700ff";
}

outDisGoal=function(){
  document.getElementsByClassName("disGoalBox")[0].style.boxShadow="0 2px 27px 0 rgba(0, 0, 0, 0.15)";
  document.getElementById("svg1").style.fill="#979797";
  document.getElementById("disq").style.color="#979797";
}

overCharGoal=function(){
  document.getElementsByClassName("charGoalBox")[0].style.boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.15)";
  document.getElementById("svg2").style.fill="#0700ff";
  document.getElementById("charq").style.color="#0700ff";
}

outCharGoal=function(){
  document.getElementsByClassName("charGoalBox")[0].style.boxShadow="0 2px 27px 0 rgba(0, 0, 0, 0.15)";
  document.getElementById("svg2").style.fill="#979797";
  document.getElementById("charq").style.color="#979797";
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////functions for departure location focus///////////////////////////////////////////////
onDepLocFocus=function(){
  document.getElementById("city1").style.boxShadow="0 2px 27px 0 rgba(7, 0, 255, 0.5)";
  document.getElementById("city1").style.border= "solid 1px #0700ff";
  document.getElementsByClassName("disGoalQuote")[0].style.color="#0700ff";
  document.getElementById("city1").style.color="#0700ff";
}

onDepLocFocOut=function(){
  document.getElementById("city1").style.boxShadow="";
  document.getElementById("city1").style.border= "solid 1px #979797";
  document.getElementsByClassName("disGoalQuote")[0].style.color="#000000";
  document.getElementById("city1").style.color="#979797";
}

onDesLocFocus=function(){
  document.getElementById("city2").style.boxShadow="0 2px 27px 0 rgba(7, 0, 255, 0.5)";
  document.getElementById("city2").style.border= "solid 1px #0700ff";
  document.getElementsByClassName("disGoalQuote")[1].style.color="#0700ff";
  document.getElementById("city2").style.color="#0700ff";
}

onDesLocFocOut=function(){
  document.getElementById("city2").style.boxShadow="";
  document.getElementById("city2").style.border= "solid 1px #979797";
  document.getElementsByClassName("disGoalQuote")[1].style.color="#000000";
  document.getElementById("city2").style.color="#979797";
}

step2back=function(){
  document.getElementById("step1").style.display="block";
  document.getElementById("step2dis").style.display="none";
  document.getElementById("step2char").style.display="none";
  document.getElementById("stepquote").innerHTML="Step 1 of 3";
  document.getElementById("city1").value=null;
  document.getElementById("city2").value=null;
}

function afterSelectGoal(){
  if(selectedGoal==1){
    document.getElementById("step1").style.display="none";
    document.getElementById("step2dis").style.display="block";
    document.getElementById("stepquote").innerHTML="Step 2 of 3";
    checkIfBlank();
  }
  else if(selectedGoal==2){
    document.getElementById("step1").style.display="none";
    document.getElementById("step2char").style.display="block";
    document.getElementById("stepquote").innerHTML="Step 2 of 3";
  }
}

step3back=function(){
  document.getElementById("step2dis").style.display="block";
  document.getElementById("step3dis").style.display="none";
  document.getElementById("stepquote").innerHTML="Step 2 of 3";
}

let distance;
let city1;
let city2; 

function getDistance(){
  city1=document.getElementById("city1").value;
  city2=document.getElementById("city2").value;
  var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function() {
      if (this.readyState==4 && this.status !== 200) {
        document.getElementById("city1").value=null;
        document.getElementById("city2").value=null;
        document.getElementById("city1").placeholder="Enter valid city name!";
        document.getElementById("city2").placeholder="Enter valid city name!";
      }
      else{
        let result=JSON.parse(this.responseText);
        let numOfKm=result.info.text;
        distance=result.info.value*100;
        document.getElementById("stepquote").innerHTML="Step 3 of 3";
        document.getElementById("step2dis").style.display="none";
        document.getElementById("step3dis").style.display="block";
        document.getElementById("from").innerHTML=city1+" ";
        document.getElementById("to").innerHTML=" "+city2;
        document.getElementsByClassName("googleQuote")[0].innerHTML="Google says it is "+numOfKm+". Hamster has to do "+distance/40+" whell spins to get there. Hit Submit button to begin";
      }
    }
    xhttp2.open("POST", "http://itsovy.sk:1206/getDistance", true);
    xhttp2.setRequestHeader('Content-Type','application/json');
    xhttp2.send(JSON.stringify({departure:city1,destination:city2}));
  //console.log(city1+" "+city2); 
}

function checkIfBlank(){
  if(document.getElementById("city1").value=="" || document.getElementById("city2").value==""){
    document.getElementById("nxtbtts2").disabled=true;
    document.getElementById("nxtbtts2").style.border= "#979797";    
    document.getElementById("nxtbtts2").style.backgroundColor= "#979797";
  }
  else{
    document.getElementById("nxtbtts2").disabled=false;
    document.getElementById("nxtbtts2").style.border= "#0700ff";    
    document.getElementById("nxtbtts2").style.backgroundColor= "#0700ff";
  }
}

function submitDistanceGoal(){
  let type=1;
  //city1
  //city2
  //distance
  //distance

  var xhr=new XMLHttpRequest();
  xhr.onreadystatechange=function(){
    if(this.readyState==4 && this.status==200){
      document.getElementsByClassName("AddedTask")[0].style.display="block";
      hideAddedGoal();
      document.getElementById("step1").style.display="block";
      document.getElementById("step2dis").style.display="none";
      document.getElementById("step3dis").style.display="none";
      document.getElementById("myModal").style.display="none";
      showAllGoals();
    }
  }
  xhr.open("POST", "http://itsovy.sk:1206/newgoal", true);
  xhr.setRequestHeader('Content-Type','application/json');
  xhr.send(JSON.stringify({type:type,deploc:city1,desloc:city2,distance:distance}));
  //console.log(JSON.stringify({type:type,deploc:city1,desloc:city2,distance:distance}))
}

function hideAddedGoal(){
  setTimeout(function(){
    document.getElementsByClassName("AddedTask")[0].style.display="none";
  }, 5000);
}

let array=[];

function showAllGoals(){
  document.getElementById("goals").innerHTML="";
  var xhr=new XMLHttpRequest();
  xhr.onreadystatechange=function(){
    if(this.readyState==4&&this.status==200){
      //console.log(this.responseText);
      array=JSON.parse(this.responseText);
      if(this.responseText!="[]"){
        array.forEach(element=>{
          document.getElementById("nogoals").style.display="none";
          document.getElementById("goals").appendChild(createBox(element));
          let done=Math.round(((element.distance-element.remaining)*100)/element.distance*100)/100;
          let todo=100-done;
          let chart=drawChart(element.id,done,todo);
          document.getElementById(element.id).innerHTML=chart;
        });
      }
      else{
        document.getElementById("nogoals").style.display="block";
      }
    }
  }
  xhr.open("GET", "http://itsovy.sk:1206/showgoals", true);
  xhr.send();
}


function createBox(element){
  i=0;
  let WhiteBox=document.createElement("div");
  WhiteBox.className="WhiteBox";

  let statSide=document.createElement("div");
  statSide.className="statSide";
  
  let goalName=document.createElement("div");
  goalName.className="goalName";
  goalName.innerHTML="DISTANCE GOAL";

  let div1=document.createElement("div");
  div1.style="display: flex; flex-wrap:wrap;margin-bottom: 16px";
  let div1_1=document.createElement("div");
  div1_1.className="CityNameLabel";
  div1_1.id="from";
  div1_1.innerHTML=element.DepLoc;
  let div1_2=document.createElement("div");
  div1_2.className="šipočka";
  div1_2.innerHTML=" -> ";
  let div1_3=document.createElement("div");
  div1_3.className="CityNameLabel";
  div1_3.innerHTML=element.DesLoc;

  let div2=document.createElement("div");
  div2.className="disGoalQuote";
  div2.innerHTML="Date of adding";
  let div3=document.createElement("div");
  div3.className="timeDiv";
  div3.id="timeDiv";

  let div5=document.createElement("div");
  div5.className="timeDiv";
  div5.id="timeDiv";
  div5.innerHTML=element.time;

  let div6=document.createElement("div");
  div6.className="disGoalQuote";
  div6.innerHTML="Distance";
  let div7=document.createElement("div");
  div7.className="timeDiv";
  div7.id="distanceDiv";
  div7.innerHTML=(element.distance-element.remaining)/100000+" km of "+element.distance/100000+" km";

  let div8=document.createElement("div");
  div8.className="disGoalQuote";
  div8.innerHTML="Number of spins";
  let div9=document.createElement("div");
  div9.className="timeDiv";
  div9.id="distanceDiv";
  div9.innerHTML=(element.distance-element.remaining)/40+" of "+element.distance/40;
  let id=element.id;
  let graphSide=document.createElement("div");
  graphSide.id=id+"a";
  graphSide.innerHTML='<svg onclick="onXclick('+id+')" xmlns="http://www.w3.org/2000/svg" class="delGoal" width="24px" height="24px" viewBox="0 0 48 48"><path fill="#0700FF" fill-rule="evenodd" d="M22.586 25L9.15 11.565l1.414-1.414L24 23.586 37.435 10.15l1.414 1.414L25.414 25 38.85 38.435l-1.414 1.414L24 26.414 10.565 39.85l-1.414-1.414L22.586 25z"/></svg>';
  let graph_container=document.createElement("canvas");
  graph_container.style="width:154px; height:154px; margin:16px";
  graph_container.id=id;

  div1.appendChild(div1_1);
  div1.appendChild(div1_2);
  div1.appendChild(div1_3);
  statSide.appendChild(goalName);
  statSide.appendChild(div1);
  statSide.appendChild(div2);
  statSide.appendChild(div3);
  statSide.appendChild(div5);
  statSide.appendChild(div6);
  statSide.appendChild(div7);
  statSide.appendChild(div8);
  statSide.appendChild(div9);

  WhiteBox.appendChild(statSide);
  graphSide.appendChild(graph_container);
  WhiteBox.appendChild(graphSide);


  return WhiteBox;
}
let pid;
onXclick=(id)=>{
  pid = id;
  console.log(pid);
  var modal = document.getElementById("myModal");
  var logo=document.getElementsByClassName("Group")[0];
  modal.style.display = "block";
  logo.style.display="none";
  document.getElementById("stepquote").style.display="none";
  document.getElementById("step1").style.display="none";
  document.getElementById("deleteGoal").style.display="block";
}

removeGoal=()=>{
  let data={id:pid};
  console.log(JSON.stringify(data));
  fetch('http://itsovy.sk:1206/deletegoal',{
    method: 'POST', 
    mode: 'cors', 
    cache: 'no-cache', 
    credentials: 'same-origin', 
    headers: {
        'Content-Type': 'application/json'
    },
    redirect: 'follow', 
    referrer: 'no-referrer', 
    body: JSON.stringify(data), 
  })
  .then(response=>{
    if(response.status==200){
      location.reload();
    }
    else{
      console.log("req didnt go well")
    }
  })
}

//////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////functions for charging goals focus//////////////////////////

oniphoneSelected=function(){
  document.getElementsByClassName("charBox")[0].style.backgroundColor="#0700ff";
  document.getElementsByClassName("charBox")[1].style.backgroundColor="#ffffff";
  document.getElementsByClassName("charBox")[2].style.backgroundColor="#ffffff";

  document.getElementById("svgIphone").style.stroke="#FFFFFF";
  document.getElementById("iphoneDiv").style.color="#FFFFFF";
  document.getElementById("svgIpad").style.stroke="#979797";
  document.getElementById("ipadDiv").style.color="#979797";
  document.getElementById("svgMac").style.stroke="#979797";
  document.getElementById("macDiv").style.color="#979797";

  document.getElementById("nextButtonChar").disabled=false;
  document.getElementById("nextButtonChar").style.backgroundColor="#0700ff";

  document.getElementsByClassName("charBox")[0].onmouseover="";
  document.getElementsByClassName("charBox")[1].onmouseover="overIpad()";
  document.getElementsByClassName("charBox")[0].onmouseout="";
  document.getElementsByClassName("charBox")[1].onmouseout="outIpad()";
  document.getElementsByClassName("charBox")[2].onmouseover="overmac()";
  document.getElementsByClassName("charBox")[2].onmouseout="outmac()";
  chargoalSelected=1;
}

onipadSelected=function(){
  document.getElementsByClassName("charBox")[0].style.backgroundColor="#ffffff";
  document.getElementsByClassName("charBox")[1].style.backgroundColor="#0700ff";
  document.getElementsByClassName("charBox")[2].style.backgroundColor="#ffffff";

  document.getElementById("svgIphone").style.stroke="#979797";
  document.getElementById("iphoneDiv").style.color="#979797";
  document.getElementById("svgIpad").style.stroke="#FFFFFF";
  document.getElementById("ipadDiv").style.color="#FFFFFF";
  document.getElementById("svgMac").style.stroke="#979797";
  document.getElementById("macDiv").style.color="#979797";

  document.getElementById("nextButtonChar").disabled=false;
  document.getElementById("nextButtonChar").style.backgroundColor="#0700ff";

  document.getElementsByClassName("charBox")[0].onmouseover="overIphone()";
  document.getElementsByClassName("charBox")[1].onmouseover="";
  document.getElementsByClassName("charBox")[0].onmouseout="outIphone()";
  document.getElementsByClassName("charBox")[1].onmouseout="";
  document.getElementsByClassName("charBox")[2].onmouseover="overmac()";
  document.getElementsByClassName("charBox")[2].onmouseout="outmac()";

  chargoalSelected=2;
}

onmacSelected=function(){
  document.getElementsByClassName("charBox")[0].style.backgroundColor="#ffffff";
  document.getElementsByClassName("charBox")[2].style.backgroundColor="#0700ff";
  document.getElementsByClassName("charBox")[1].style.backgroundColor="#ffffff";

  document.getElementById("svgIphone").style.stroke="#979797";
  document.getElementById("iphoneDiv").style.color="#979797";
  document.getElementById("svgIpad").style.stroke="#979797";
  document.getElementById("ipadDiv").style.color="#979797";
  document.getElementById("svgMac").style.stroke="#FFFFFF";
  document.getElementById("macDiv").style.color="#FFFFFF";

  document.getElementById("nextButtonChar").disabled=false;
  document.getElementById("nextButtonChar").style.backgroundColor="#0700ff";

  document.getElementsByClassName("charBox")[0].onmouseover="overIphone()";
  document.getElementsByClassName("charBox")[1].onmouseover="overIpad()";
  document.getElementsByClassName("charBox")[0].onmouseout="outIphone()";
  document.getElementsByClassName("charBox")[1].onmouseout="outIpad()";
  document.getElementsByClassName("charBox")[2].onmouseover="";
  document.getElementsByClassName("charBox")[2].onmouseout="";

  chargoalSelected=3;
}

overIphone=function(){
  document.getElementsByClassName("charBox")[0].style.boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.15)";
  document.getElementById("svgIphone").style.stroke="#0700ff";
  document.getElementById("iphoneDiv").style.color="#0700ff";
}

outIphone=function(){
  document.getElementsByClassName("charBox")[0].style.boxShadow="0 2px 27px 0 rgba(0, 0, 0, 0.15)";
  document.getElementById("svgIphone").style.stroke="#979797";
  document.getElementById("iphoneDiv").style.color="#979797";
}

overIpad=function(){
  document.getElementsByClassName("charBox")[1].style.boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.15)";
  document.getElementById("svgIpad").style.stroke="#0700ff";
  document.getElementById("ipadDiv").style.color="#0700ff";
}

outIpad=function(){
  document.getElementsByClassName("charBox")[1].style.boxShadow="0 2px 27px 0 rgba(0, 0, 0, 0.15)";
  document.getElementById("svgIpad").style.stroke="#979797";
  document.getElementById("ipadDiv").style.color="#979797";
}

overmac=function(){
  document.getElementsByClassName("charBox")[2].style.boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.15)";
  document.getElementById("svgMac").style.stroke="#0700ff";
  document.getElementById("macDiv").style.color="#0700ff";
}

outmac=function(){
  document.getElementsByClassName("charBox")[2].style.boxShadow="0 2px 27px 0 rgba(0, 0, 0, 0.15)";
  document.getElementById("svgMac").style.stroke="#979797";
  document.getElementById("macDiv").style.color="#979797";
}

char3step=function(){
  document.getElementById("step2char").style.display="none";
  document.getElementById("step3char").style.display="block";
  if(chargoalSelected==1){
    document.getElementById("deviceName").innerHTML="iPhone Xs";
    document.getElementById("baterryCapacity").innerHTML="2658 mAh";
    document.getElementById("iphoneChargeSVG").style.display="block";
  }
  else if(chargoalSelected==2){
    document.getElementById("deviceName").innerHTML="iPad";
    document.getElementById("baterryCapacity").innerHTML="8827 mAh";
    document.getElementById("ipadChargeSVG").style.display="block";
  }
  else if(chargoalSelected==3){
    document.getElementById("macChargeSVG").style.display="block";
    document.getElementById("deviceName").innerHTML="MacBook Pro";
    document.getElementById("baterryCapacity").innerHTML="6330 mAh";
  }
}

step3charBack=function(){
  document.getElementById("macChargeSVG").style.display="none";
  document.getElementById("iphoneChargeSVG").style.display="none";
  document.getElementById("ipadChargeSVG").style.display="none";
  document.getElementById("step2char").style.display="block";
  document.getElementById("step3char").style.display="none";
  document.getElementById("stepquote").innerHTML="Step 2 of 3";
}