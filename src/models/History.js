import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
    {
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        lastMessage: {
            text: String,
            senderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            createdAt: Date,
        },

        unreadCount: {
            type: Map,
            of: Number,
            default: {},
            // example: { userId: 3 }
        },
    },
    { timestamps: true }
);

// same user pair এর জন্য duplicate conversation আটকাতে
ConversationSchema.index({ members: 1 });

export default mongoose.models.Conversation ||
    mongoose.model("Conversation", ConversationSchema);
