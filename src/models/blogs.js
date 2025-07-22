import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    content: { type: String, required: true },
    images: [
      {
        url: { type: String, trim: true },
        public_id: { type: String, trim: true },
      },
    ],
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
