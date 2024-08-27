import express from "express"
import {Request, Response} from "express"
import cors from "cors"
import mongoose from "mongoose"
import "dotenv/config"
import { Server } from "socket.io"
import http from "http"
import userRouter from "../routers/UserRouter"
import cookieParser from "cookie-parser"
import session from "express-session"
import { authMiddleware, getUserFromToken } from "../middleware/auth"
import convoRouter from "../routers/ConvoRouter"
import { userModel } from "../models/User"
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors : {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
})
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET!,
    saveUninitialized: true,
    resave: true
}));
let set = new Set<string>()
let map = new Map()
io.on("connection", async (socket) => {
     socket.on("connectionMade", async (data) =>{
        map.set(socket.id, data)
        console.log(map)
        socket.join(data)
        set.add(String(data))
        const currUser = await userModel.findById(data)
        await userModel.findByIdAndUpdate(data, {isOnline: true})
        currUser?.friends.forEach((friend) => {
            io.to(String(friend?.friendId?.toString())).emit("onlineStatus", data)
        })
        console.log(set)
     })
    
     socket.on("notificationSent", (data) => {
        const identity = set.has(data.to)
        if(!identity){
            return
        }
        if(data.type == "request"){
            io.to(data.to).emit("notificationReceived", 
                {
                    type: "request",
                    action: data.action
                }
            )
        }
     })
     socket.on("messageSent", (data) => {
        console.log(data)
        const identity = set.has(data.receiver.toString())
        if(!identity){
            return
        }
        io.to(data.receiver.toString()).emit("messageReceived", data)
        io.to(data.receiver.toString()).emit("messageReceivedC", data)
        io.to(data.sender.toString()).emit("messageUpdate", data)
     })

     socket.on("friendRequestAccepted", (data) => {
        const identity = set.has(data.from.toString())
        if(!identity){
            return
        }
        io.to(data.from.toString()).emit("accept_Effect", data)
     })

     socket.on("disconnect", async () => {
        const id = map.get(socket.id)
        map.delete(socket.id)
        set.delete(String(id))
        await userModel.findByIdAndUpdate(id, {isOnline: false})
        const currUser = await userModel.findById(id)
        currUser?.friends.forEach((friend) => {
            io.to(String(friend?.friendId)).emit("offlineStatus", id)
        })
        
     })

})

try{
    mongoose.connect("mongodb+srv://harwinsodhi33:"+process.env.MONGO_PASS+"@cluster0.vznh590.mongodb.net/")
}
catch(err){
    console.log(err)
}


app.use(express.json())
app.use(cors())

app.use("/api/user", userRouter)
app.use("/api/convo", convoRouter)
server.listen(process.env.PORT,() => {
    console.log("listening")
})