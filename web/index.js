$(document).ready(function(){  
	const socket = io.connect('http://itsovy.sk:1206');
	socket.on('connect', (data) => {
		console.log('check',socket.connected);
		console.log(data);
		socket.emit("speed");
	});
})
