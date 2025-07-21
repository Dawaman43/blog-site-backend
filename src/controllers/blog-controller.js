import Blog from "../models/blogs.js";
import cloudinary from "../utils/cloudinary.js";

export const createBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const imageUrls = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required to create a blog",
      });
    }

    const createPost = await Blog.create({
      title,
      content,
      images: imageUrls,
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: createPost,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Can't find blog with the provided id",
      });
    }

    for (const img of blog.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await blog.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find();

    if (blogs.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Can't find blogs" });
    }

    return res
      .status(200)
      .json({ success: true, blogs, message: "Blogs fetch successfully" });
  } catch (error) {
    next(error);
  }
};

export const getSingleBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Can't find blog with the provided id",
      });
    }

    return res
      .status(200)
      .json({ success: true, blog, message: "Message fetch successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body || {};

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Can't find blog with the provided id",
      });
    }

    if (title) blog.title = title;
    if (content) blog.content = content;

    if (req.files && req.files.length > 0) {
      for (const img of blog.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      blog.images = newImages;
    }

    await blog.save();

    return res
      .status(200)
      .json({ success: true, message: "Blog updated successfully", blog });
  } catch (error) {
    next(error);
  }
};
