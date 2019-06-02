function getDistanceBetween(){
    var xhttp=new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let res=JSON.parse(this.responseText);
            document.getElementById("todaydis").innerHTML=res.distancetoday/100.0;
        }
    };
    xhttp.open("GET", "http://itsovy.sk:1206/distancetoday", true);
    xhttp.send();
}


var modal = document.getElementById("myModal");
var logo=document.getElementsByClassName("Group")[0];
// Get the button that opens the modal
var btn = document.getElementById("button");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
  logo.style.display="none";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
  logo.style.display="block";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    logo.style.display="block";
  }
}

ondisGoalSelected=function(){
    document.getElementsByClassName("disGoalBox")[0].style.backgroundColor="#0700ff";
    document.getElementsByClassName("img1").fill="#ffffff";
    document.getElementById("nextB").disabled=false;
    document.getElementById("nextB").style.backgroundColor="#0700ff";
}
