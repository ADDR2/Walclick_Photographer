module.exports = async (data, socket, { createMainConnection, createCoordsEvent }) => {
    const serverSocket = await createMainConnection();
    serverSocket.emit('photographerClooking', data);

    serverSocket.on('response', result => {
        !socket.listeners('coords').length && createCoordsEvent(socket, serverSocket);

        socket.emit('response', result);
    });
};