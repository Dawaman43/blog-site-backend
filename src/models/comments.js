import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likeCount: { type: Number, default: 0 },
    depth: { type: Number, default: 0 }, // New field for nesting depth
  },
  { timestamps: true }
);

commentSchema.index({ blog: 1, parentComment: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
