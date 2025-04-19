
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const server = new WebSocket.Server({ port: 8080 });

let clients = new Set();

let web;


server.on('connection', (ws) => {
    console.log('Client connected');
    clients.add(ws);
    ws.send("255000000")
    
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    ws.on('message', (message) => {
        if(message == 'client'){

            console.log("Web connected");
            clients.delete(ws);
            web = ws;
        }
        else{
            console.log('Received message:' + message);
            broadcast("" + message);
        }
    });
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

function broadcast(msg){
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            console.log(msg);
            client.send(msg);
        }
        else{
            console.log('Client not open, removing...');
            clients.delete(client);
        }
    }
    )
}

function broadcastColor(red, green, blue){
    broadcast(red*1000000+green*1000+blue);
}

function readColor(s){
    s = s.toString();
    let red = Number(s.substring(0, 3));   // Extract first 3 digits
    let green = Number(s.substring(3, 6)); // Extract next 3 digits
    let blue = Number(s.substring(6, 9));  // Extract last 3 digits
    console.log(red, green, blue);
    return [red, green, blue];
}