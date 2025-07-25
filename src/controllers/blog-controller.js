import Blog from "../models/blogs.js";
import Comment from "../models/comments.js";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import slugify from "slugify";

export const createBlog = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;

    const imageUrls = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and category are required",
      });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const createPost = await Blog.create({
      title,
      content,
      images: imageUrls,
      slug,
      category,
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: createPost,
      slug,
      author: req.user.id,
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

    // Delete associated comments
    await Comment.deleteMany({ blog: req.params.id });

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
    const { category } = req.query;

    const filter = category ? { category } : {};
    const blogs = await Blog.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog",
          as: "comments",
        },
      },
      {
        $addFields: {
          commentCount: { $size: "$comments" },
        },
      },
      {
        $project: {
          comments: 0,
        },
      },
    ]);

    if (blogs.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Can't find blogs" });
    }

    return res
      .status(200)
      .json({ success: true, blogs, message: "Blogs fetched successfully" });
  } catch (error) {
    next(error);
  }
};

export const getSingleBlog = async (req, res, next) => {
  try {
    const blog = await Blog.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog",
          as: "comments",
        },
      },
      {
        $addFields: {
          commentCount: { $size: "$comments" },
        },
      },
      {
        $project: {
          comments: 0,
        },
      },
    ]);

    if (!blog || blog.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Can't find blog with the provided id",
      });
    }

    return res.status(200).json({
      success: true,
      blog: blog[0],
      message: "Blog fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { title, content, category } = req.body || {};

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Can't find blog with the provided id",
      });
    }

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (category) blog.category = category;

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

    // Fetch updated comment count
    const updatedBlog = await Blog.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog",
          as: "comments",
        },
      },
      {
        $addFields: {
          commentCount: { $size: "$comments" },
        },
      },
      {
        $project: {
          comments: 0,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog: updatedBlog[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.aggregate([
      { $match: { slug: req.params.slug } },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog",
          as: "comments",
        },
      },
      {
        $addFields: {
          commentCount: { $size: "$comments" },
        },
      },
      {
        $project: {
          comments: 0,
        },
      },
    ]);

    if (!blog || blog.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      blog: blog[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogCategories = async (req, res, next) => {
  try {
    const categories = await Blog.distinct("category");

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found",
      });
    }

    return res.status(200).json({
      success: true,
      categories,
      message: "Categories fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const incrementViewCount = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Can't find blog with the provided id",
      });
    }

    // Increment view count (assuming Blog schema has a views field)
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    // Fetch updated blog with comment count for consistency
    const updatedBlog = await Blog.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog",
          as: "comments",
        },
      },
      {
        $addFields: {
          commentCount: { $size: "$comments" },
        },
      },
      {
        $project: {
          comments: 0,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "View count incremented successfully",
      blog: updatedBlog[0],
    });
  } catch (error) {
    next(error);
  }
};
