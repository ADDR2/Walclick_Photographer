function connect() {
    var socket = io();

    socket.on('connect', function() {
        console.log("I'm connected");
    });

    socket.on('disconnect', function() {
        console.log('Disconnected from server');
    });

    socket.on('actionError', function(error) {
        alert(error);
    });

    socket.on('clientLooking', function(clientUsername) {
        var result = confirm("Hey buddy, it seems " +clientUsername + " wants something from you. Are you taking the job?");
        socket.emit('confirmJob', {
            result: result || undefined,
            error: !result && 'Photographer does not want the job'
        });
    });

    socket.on('arrived', function() {
        alert('arrived');
        serverSocket.disconnect();
    });

    return socket;
}

function findClient() {
    var socket = connect();
    if (!("geolocation" in navigator)) {
        return alert('Geolocation not supported by your browser.');
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {
            socket.emit(
                'looking',
                {
                    username: document.querySelector('input[type="email"]').value,
                    lat: position.coords.latitude,
                    long: position.coords.longitude,
                    alt: position.coords.altitude,
                    socketId: socket.id
                },
                console.log
            );
        },
        function(error) {
            alert('Unable to fetch location.');
        }
    );
}

function disconnect(socket) {
    return socket.disconnect();
}