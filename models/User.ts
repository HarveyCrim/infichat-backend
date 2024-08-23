import mongoose from "mongoose"
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    profile_pic: {
        type: String,
    },
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CUser"
    }],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CUser"
    }],
    notifications:[{
        kind: {
            type: String,
            enum: ["request", "message"]
        },
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CUser"
        }
    }],
    isOnline: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

export const userModel = mongoose.model("CUser", userSchema)
