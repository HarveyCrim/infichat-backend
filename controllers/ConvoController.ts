import {Request, Response} from "express"
import { convoModel } from "../models/Conversation"
import { messageModel } from "../models/Message"
import { userModel } from "../models/User"

const addToConvo = async (req: Request, res: Response) => {
    let convo = await convoModel.findOne({$or: [{$and: [{sender: req.body.sender}, {receiver: req.body.receiver}]},
        {$and: [{sender: req.body.receiver}, {receiver: req.body.sender}]}]}
    )
    if(!convo){
        convo = await convoModel.create({
            sender: req.body.sender,
            receiver: req.body.receiver
        })
    }
    const message = await messageModel.create(req.body.message)
    await convoModel.updateOne({
        $or:[
            {$and : [{sender: req.body.sender}, {receiver: req.body.receiver}]},
            {$and : [{sender: req.body.receiver}, {receiver: req.body.sender}]}
        ]
    }, {
        $push : {messages : message._id}
    })                          
    await userModel.updateOne(
        { _id: req.body.sender, "friends.friendId": req.body.receiver },
        {
            $set: {
                "friends.$.lastMessage": message
             }
        }
    )
    await userModel.updateOne(
        { _id: req.body.receiver, "friends.friendId": req.body.sender },
        {
            $set: {
                "friends.$.lastMessage": message
             }
        }
    )
    return res.json({sender: req.body.sender, receiver: req.body.receiver, message})
}

const addToUnread = async (req: Request, res: Response) => {
    await userModel.updateOne({_id: req.body.receiver, "friends.friendId": req.body.sender},
        {
            $push : {"friends.$.unread" : req.body.message}
        }
    )
    return res.json({message: "updated"})
}

const removeUnread = async (req: Request, res: Response) => {
    await userModel.updateOne({_id: req.body.sender, "friends.friendId": req.body.receiver},
        {
            $set : {"friends.$.unread" : []}
        }
    )
    return res.json({message: "updated"})
}

const getConvo = async (req: Request, res: Response) => {
    const convo = await convoModel.findOne(
        {
            $or:[
                {$and : [{sender: req.body.sender}, {receiver: req.body.receiver}]},
                {$and : [{sender: req.body.receiver}, {receiver: req.body.sender}]}
            ]
        }
    ).populate("messages")
    return res.json(convo)
}
export default {addToConvo, getConvo, addToUnread, removeUnread}