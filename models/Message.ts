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
    seen: Boolean,

}, {
    timestamps: true
})

export const messageModel = mongoose.model("Message", messageSchema)