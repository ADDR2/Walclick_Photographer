const fs = require('fs');

const folder = `${__dirname}/../frontConnections/`;

const handleServerEvents = (io, permanentConnection) => {
    permanentConnection.on('clientLooking', ({ clientUsername, photographersActive }, ack) => {
        try {
            const connectedPhotographers = [];
            photographersActive.forEach( photographerInfo => {
                const sockets = io.sockets.sockets;
                const { socketId } = photographerInfo;
                if(socketId in sockets && sockets[socketId].listenerCount('confirmJob') <= 0)
                    connectedPhotographers.push(photographerInfo);
            });

            if(!connectedPhotographers.length) ack(undefined, 'No photographer connected');
            else {
                let responses = 0;
                let timer;

                connectedPhotographers.forEach( photographerInfo => {
                    io.sockets.sockets[photographerInfo.socketId].on('confirmJob', ({result, error}) => {
                        if(!error && !(responses++)) ack(photographerInfo), timer && clearTimeout(timer);
                        else io.to(photographerInfo.socketId).emit('actionError', 'We could not connect with the client');

                        io.sockets.sockets[photographerInfo.socketId].removeAllListeners('confirmJob');
                    });

                    io.to(photographerInfo.socketId).emit(
                        'clientLooking',
                        clientUsername
                    );
                });

                timer = setTimeout(
                    () => (responses <= 0 && ack(undefined, 'No photographer responded'), responses++)
                    , 30000
                );
            }
        } catch(error) {
            ack(undefined, error.message);
            console.log(error);
        }
    });
};

module.exports = (io, createMainConnection, permanentConnection) => {
    handleServerEvents(io, permanentConnection);

    io.on('connection', async socket => {
        console.log('New photographer connected');
        try {        
            socket.on('disconnect', () => {
                console.log('Photographer disconnected');
            });

            fs.readdir(folder, (err, files) => {
                if(err) throw new Error(err);

                for(file of files) {
                    file !== 'index.js' && socket.on(file.replace('.js', ''), (data, ack) => {
                        require(`./${file}`)(data, socket, {
                            createMainConnection,
                            ack
                        }).catch( error => {
                            console.log(error);
                            socket.disconnect();
                        });
                    });
                }
            });
        } catch(error) {
            console.log(error);
            socket.disconnect();
        }
    });
};