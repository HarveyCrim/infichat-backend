import {Request, Response} from "express"
import { convoModel } from "../models/Conversation"
import { messageModel } from "../models/Message"

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
    return res.json({sender: req.body.sender, receiver: req.body.receiver, message})
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
export default {addToConvo, getConvo}