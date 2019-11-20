import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import moment from 'moment';

const socket = io('localhost:5000/test');

const App = () => {
    const [message, setMessage] = useState(null);

    const [isListeningToCount, setIsListeningToCount] = useState(false);
    const [count, setCount] = useState(0);
    const [isPositive, setIsPositive] = useState(true);

    const [isListeningToClock, setIsListeningToClock] = useState(false);
    const [timeFormat, setTimeFormat] = useState('DD MM YYYY');
    const [time, setTime] = useState(moment().format(timeFormat));

    useEffect(() => {
        if (isListeningToCount) {
            socket.emit('subscribeToCount', isPositive); 
        } else {
            socket.emit('unsubscribeToCount'); 
        }
    }, [isListeningToCount])

    useEffect(() => {
        if (isListeningToClock) {
            socket.emit('subscribeToClock', timeFormat); 
        } else {
            socket.emit('unsubscribeToClock'); 
        }
    }, [isListeningToClock])

    useEffect(() => {
        socket.emit('changeSign', isPositive); 
    }, [isPositive])

    useEffect(() => {
        socket.emit('changeFormat', timeFormat); 
    }, [timeFormat])

    useEffect(() => {
        socket.on('message', message => {
            setMessage(message);
        })

        socket.on('count', count => {
            setCount(count);
        })

        socket.on('time', time => {
            setTime(time);
        })
    })

    const onSignToggle = () => setIsPositive(!isPositive);
    const onCountToggle = () => setIsListeningToCount(!isListeningToCount);
    const onClockToggle = () => setIsListeningToClock(!isListeningToClock);

    return (
        <>
            <h1>Message</h1>
            <p>{message}</p>
            <hr />

            <h2>Count</h2>
            <p>{count}</p>
            <button onClick={onSignToggle}>{isPositive ? 'Change to negative' : 'Change to positive'}</button>
            <button onClick={onCountToggle}>{isListeningToCount ? 'Stop listening' : 'Start listening'}</button>
            <hr />

            <h2>Time</h2>
            <p>{time}</p>
            <input value={timeFormat} onChange={e => setTimeFormat(e.target.value)} />
            <button onClick={onClockToggle}>{isListeningToClock ? 'Stop listening' : 'Start listening'}</button>
        </>
    );
};

ReactDOM.render(<App />, document.querySelector('#root'));