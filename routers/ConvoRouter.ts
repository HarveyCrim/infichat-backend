import express from "express"
import convoController from "../controllers/ConvoController"
import { authMiddleware } from "../middleware/auth"
const convoRouter = express.Router()

convoRouter.post("/create", authMiddleware, convoController.addToConvo)
convoRouter.post("/convo", authMiddleware, convoController.getConvo)
export default convoRouter