const express = require('express');
require("dotenv").config();
const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
mongoose.connect(process.env.mongoUrl, {
    useNewUrlParser: true
}).then(() => { console.log("Connected to database"); })
    .catch(e => console.log(e));

const conn = mongoose.createConnection(process.env.mongoUrl);
const app = express();

app.use(express.json());
const cors = require('cors');
//var tools = require('./index');
app.use(cors({
    origin: '*'
}));


const http = require("http");
const { send } = require('process');
const { error } = require('console');
const socket = http.createServer(app)
const io = require("socket.io")(socket, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
})



//............ videocall functionality.............//
io.on("connection", (socket) => {
    console.log("i am called");
    // console.log(socket.id, 'connected');
    const id = socket.id;
    socket.emit("me", id);
    // console.log(id);
    socket.on("patientdisconnect", (data) => {
        // socket.emit("endfromboth", { callend: data.callend });
        io.to(data.userTocall).emit("endfrompatient", { callend: data.callend });
    })
    socket.on("doctordisconnect", (data) => {
        console.log("disconnect from doctor");
        // socket.emit("endfromboth", { callend: data.callend });
        io.to(data.to).emit("endfromdoctor", { callend: data.callend });
    })
    socket.on("disconnect", (data) => {

        socket.broadcast.emit("callEnded")
    })

    socket.on("callUser", (data) => {
        console.log("server called data from patient")
        io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
    })

    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal)
    })
})

const PORT = 8001 || process.env.PORT
const mode = "devlopment"
socket.listen(PORT, () => {
    console.log("video call running on" + PORT);
    //console.log(`server running successfully on ${mode} mode on port ${port}`);
});