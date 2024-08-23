import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import "dotenv/config"
import { Server } from "socket.io"
import http from "http"
import userRouter from "../routers/UserRouter"
import { getUserFromToken } from "../middleware/auth"
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
let set:onlineUser[] = []

io.on("connection", async (socket) => {
     const token = socket.handshake.auth.token
     const userFromToken = await getUserFromToken(token)
     for(let i = 0; i < set.length; i++){
        if(set[i].id == userFromToken?._id.toString()){
            set.splice(i, 1)
        }
     }
     set.push({id: userFromToken?._id.toString()!, socketId: socket.id})
     console.log(set)
     socket.on("notificationSent", (data) => {
        const identity = set.find(item => item.id.toString() == data.to.toString())
        if(!identity){
            return
        }
        if(data.type == "request"){
            console.log("sent")
            socket.to(identity.socketId).emit("notificationReceived", 
                {
                    from : userFromToken?.id,
                    type: "request",
                    action: data.action
                }
            )
        }
     })
     socket.on("friendRequestAccepted", (data) => {
        console.log("data", data)
        const identity = set.find(item => item.id.toString() == data.from.toString())
        if(!identity){
            return
        }
        socket.to(identity.socketId).emit("acceptHandler")
     })
     io.on("disconnect", () => {
        set = set.filter((item) => {
            return item.id !== socket.id
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
server.listen(process.env.PORT,() => {
    console.log("listening")
})