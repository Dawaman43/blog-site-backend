import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  images: [{ url: String, public_id: String }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Removed required: true
  readCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Blog", blogSchema);
