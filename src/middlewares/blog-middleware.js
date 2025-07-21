import Blog from "../models/blogs.js";

export const blogMiddleware = async (req, res, next) => {
  try {
    const { blogId } = req.params;

    if (!blogId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Blog ID" });
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    req.blog = blog;

    next();
  } catch (error) {
    next(error);
  }
};
