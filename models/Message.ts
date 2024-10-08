import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    text: {
        type : String,
    },
    imageUrl: {
        type: String
    },
    videoUrl: {
        type: String
    },
    seen: {
        type: Boolean,
        default: false
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CUser"
    }

}, {
    timestamps: true
})

export const messageModel = mongoose.model("Message", messageSchema)