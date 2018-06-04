const fs = require('fs');

const folder = `${__dirname}/../frontConnections/`;

const handleServerEvents = (io, permanentConnection) => {
    permanentConnection.on('clientLooking', ({ clientInfo }, ack) => {
        try {

        } catch(error) {
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