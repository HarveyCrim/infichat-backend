import { Request, Response } from "express"
import { userModel } from "../models/User"
import jwt from "jsonwebtoken"
const createUser = async (req: Request, res: Response) => {
    let currUser = await userModel.findOne({email: req.body.email})
    if(!currUser){
        currUser = await userModel.create({
            name: req.body.name,
            email: req.body.email
        })
    }
    const token = "Bearer "+jwt.sign({email: currUser.email}, process.env.JWT_SECRET as string)
    res.cookie("token", token)
    res.json({token, _id: currUser._id.toString()})
}

const updateUser = async(req: Request, res: Response) => {
    const {email} = res.locals.verified
    const user = await userModel.findOne({email})
    const updateUser = await userModel.findByIdAndUpdate(user?._id, req.body, {new : true})
    res.json(updateUser)
}

const getSpecificUser = async (req: Request, res: Response) => {
    const currUser = await userModel.findOne({email : res.locals.verified.email})
    const user = await userModel.findOne({email: req.params.email})
    if(currUser?.email === req.params.email){
        return res.json(null)
    }
    const friend = currUser?.friends.find((item) => item?.friendId?.toString() == user?._id.toString())
    if(friend){
        return res.json(null)
    }
    return res.json(user)
}

const friendOrNot = async (req: Request, res: Response) => {
    const currUser = await userModel.findOne({email: res.locals.verified.email})
    for(let i = 0; i < currUser?.friendRequests?.length!; i++){
        if(currUser?.friendRequests[i]._id.toString() == req.params._id){
           return res.json({message: true})
        }
    }
    return res.json({message: false})
}

const sendFriendRequest = async (req: Request, res: Response) => {
    const currUser = await userModel.findOne({email: res.locals.verified.email})
    for(let i = 0; i < currUser?.friendRequests?.length!; i++){
        if(currUser?.friendRequests[i]._id.toString() == req.params._id.toString()){
            await userModel.updateOne({email: res.locals.verified.email}, {
                $pull : {friendRequests: req.params._id}
            })
            await userModel.findByIdAndUpdate(req.params._id, {
                $pull : {notifications: {kind: "request", from: currUser._id}}
            })
            return res.json({message:"removed", to: req.params._id, from: req.params.sender})
        }
    }
    await userModel.updateOne({email: res.locals.verified.email}, {
        $push : {friendRequests: req.params._id},
    })
    await userModel.findByIdAndUpdate(req.params._id, {
        $push : {notifications : {kind: "request", from : currUser?._id}}
    })
    return res.json({message: "added", to: req.params._id})
}

const acceptFriendRequest = async (req: Request, res: Response) => {
    const {sender, decision} = req.body
    const currUser = await userModel.findOne({email: res.locals.verified.email})
    if(decision === "reject"){
        await userModel.findByIdAndUpdate(currUser?._id, {
            $pull : {notifications : {kind: "request", from: sender}}
        })
        return res.json({message : "rejected"})
    }
    await userModel.findByIdAndUpdate(sender, {
        $push : {friends : {friendId : currUser?._id, lastMessage: null, unread:[]}},
        $pull : {friendRequests : currUser?._id}
    })
    await userModel.findByIdAndUpdate(currUser?._id, {
        $push : {friends: {friendId: sender, lastMessage: null, unread: []}},
        $pull : {notifications : {kind: "request", from: sender}}
    })
    return res.json({message: "accepted", from: sender})
}

const getUser = async(req: Request, res: Response) => {
    const currUser = await userModel.findOne({email: res.locals.verified.email}).populate("notifications.from").populate("friends.friendId").populate("friends.lastMessage")
    res.json(currUser)
}
export default {createUser, getUser, updateUser, getSpecificUser, sendFriendRequest, friendOrNot, acceptFriendRequest}