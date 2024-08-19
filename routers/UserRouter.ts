import express from "express"
import UserController from "../controllers/UserController"
import { authMiddleware } from "../middleware/auth"
const userRouter = express.Router()

userRouter.get("/current", authMiddleware, UserController.getUser)
userRouter.put("/update", authMiddleware, UserController.updateUser)
userRouter.post("/create", UserController.createUser)
userRouter.get("/specific/:email", authMiddleware, UserController.getSpecificUser)
userRouter.get("/sendRequest/:_id", authMiddleware, UserController.sendFriendRequest)
userRouter.get("/friendOrNot/:_id", authMiddleware, UserController.friendOrNot)
userRouter.post("/friend-request/respond", authMiddleware, UserController.acceptFriendRequest)
export default userRouter