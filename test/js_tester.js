const FireEye = require('../index.js')

socket = new FireEye()

socket.on('image', (data) => {
	console.log('WE GOT AN IMAGE YEAAAAA');
})
