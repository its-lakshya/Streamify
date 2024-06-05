import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,  // One show is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,  // One to whom subscriber is subscribint to
        ref: "User"
    }
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)