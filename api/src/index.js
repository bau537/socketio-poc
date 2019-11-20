const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const moment = require('moment');

const port = 5000;

//Default namespace
io.on('connection', socket => {
    socket.emit('message', 'Welcome')
})

//Test namespace
const testNsp = io.of('/test');

let count = 0;

setInterval(() => {
    count++;

    testNsp.in('count').clients((error, clients) => clients.map(client => {
        const socket = testNsp.connected[client];
        testNsp.to(client).emit('count', socket.context.isPositive ? count : -Math.abs(count))
    }))

    testNsp.in('clock').clients((error, clients) => clients.map(client => {
        const socket = testNsp.connected[client];
        testNsp.to(client).emit('time', moment().format(socket.context.format))
    }))
}, 1000);

testNsp.on('connection', socket => {
    socket.emit('message', 'Welcome to the test')

    socket.on('subscribeToCount', isPositive => {
        socket.context = {
            ...socket.context,
            isPositive
        };
        socket.join('count');
    })

    socket.on('changeSign', isPositive => {
        socket.context = {
            ...socket.context,
            isPositive
        };
    })

    socket.on('unsubscribeToCount', () => {
        socket.leave('count');
    })

    socket.on('subscribeToClock', format => {
        socket.context = {
            ...socket.context,
            format
        };
        socket.join('clock');
    })

    socket.on('changeFormat', format => {
        socket.context = {
            ...socket.context,
            format
        };
    })

    socket.on('unsubscribeToClock', () => {
        socket.leave('clock');
    })
})

http.listen(port, () => console.log(`Listening on port ${port}`));