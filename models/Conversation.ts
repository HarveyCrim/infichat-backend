import mongoose from "mongoose"

const convoSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CUser"
    },
    receiver : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CUser"
    },
    messages : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ] 
}, {
    timestamps: true
})

export const convoModel = mongoose.model("Conversation", convoSchema)