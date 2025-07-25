import Blog from "../models/blogs.js";

export const blogMiddleware = async (req, res, next) => {
  try {
    const { id, blogId } = req.params; // Support both :id and :blogId
    const identifier = id || blogId;
    console.log(`[Backend] Blog middleware for identifier: ${identifier}`);

    if (!identifier) {
      console.warn("[Backend] No blog identifier provided in middleware");
      return res
        .status(400)
        .json({ success: false, message: "Blog identifier required" });
    }

    const blog = await Blog.findById(identifier);
    if (!blog) {
      console.warn(
        `[Backend] Blog not found in middleware for identifier: ${identifier}`
      );
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    req.blog = blog;
    console.log(`[Backend] Blog attached to req: ${blog._id}`);
    next();
  } catch (error) {
    console.error(`[Backend] Blog middleware error: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
