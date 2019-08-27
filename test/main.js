var socket = io();

socket.on('image', (data) => {
	$("#img").attr({
		"src":"data:image/png;base64,"+data,
		"width": "50%", "height": "50%"
	});
})