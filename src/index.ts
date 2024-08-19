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
let set = new Set()
io.on("connection", async (socket) => {
    set.add(socket.id)
     const token = socket.handshake.auth.token
     const currUser = await getUserFromToken(token)
     const id = currUser?._id.toString()
     socket.join(id!)
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