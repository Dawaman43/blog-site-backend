import Blog from "../models/blogs.js";
import Comment from "../models/comments.js";

export const createComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const user = req.user.id;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Comment is missing" });
    }

    const comment = await Comment.create({
      user,
      blog: req.blog._id,
      text,
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const comment = await Comment.find({ blog: req.blog._id })
      .populate("user", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

export const getComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      blog: req.blog.id,
    }).populate("user", "username email");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Can't find comment with the provided id",
      });
    }

    return res.status(200).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { text } = req.body || {};
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      blog: req.blog.id,
    }).populate("user", "username email");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Can't find comment with the provided id",
      });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    comment.text = text || comment.text;

    await comment.save();

    return res.status(200).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      blog: req.blog.id,
    }).populate("user", "username email");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Can't find comment with the provided id",
      });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await comment.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};
