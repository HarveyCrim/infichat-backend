import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import "dotenv/config"
import { Server } from "socket.io"
import http from "http"
import userRouter from "../routers/UserRouter"
import { getUserFromToken } from "../middleware/auth"
import convoRouter from "../routers/ConvoRouter"
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors : {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
})
type onlineUser = {
    id: string,
    socketId: string
}
let set = new Set()
io.on("connection", async (socket) => {
     socket.on("connectionMade", async (data) =>{
        socket.join(data)
        set.add(data)
        console.log(set)
     })
    
     socket.on("notificationSent", (data) => {
        const identity = set.has(data.to)
        if(!identity){
            return
        }
        if(data.type == "request"){
            console.log("sent")
            socket.to(data.to).emit("notificationReceived", 
                {
                    type: "request",
                    action: data.action
                }
            )
        }
     })
     socket.on("messageSent", (data) => {
        const identity = set.has(data.receiver.toString())
        if(!identity){
            return
        }
        console.log("yup")
        socket.to(data.receiver.toString()).emit("messageReceived", data)
     })

     socket.on("friendRequestAccepted", (data) => {
        // console.log("data", data)
        const identity = set.has(data.from.toString())
        if(!identity){
            return
        }
        console.log("emitted")
        socket.to(data.from.toString()).emit("accept_Effect", data)
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