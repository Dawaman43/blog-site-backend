import Blog from "../models/blogs.js";
import Comment from "../models/comments.js";

export const createComment = async (req, res, next) => {
  try {
    const { text, parentComment } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user in request",
      });
    }

    const user = req.user._id;
    const MAX_DEPTH = 2;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment is missing",
      });
    }

    let depth = 0;
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent || parent.blog.toString() !== req.blog._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent comment",
        });
      }
      depth = parent.depth + 1;
      if (depth > MAX_DEPTH) {
        return res.status(400).json({
          success: false,
          message: `Maximum reply depth of ${MAX_DEPTH} reached`,
        });
      }
    }

    const comment = await Comment.create({
      user,
      blog: req.blog._id,
      text,
      parentComment: parentComment || null,
      likes: [],
      likeCount: 0,
      depth,
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error("[createComment] Error:", error);
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const populateReplies = async (commentId) => {
      const replies = await Comment.find({ parentComment: commentId })
        .populate("user", "username email")
        .sort({ createdAt: 1 });

      return Promise.all(
        replies.map(async (reply) => {
          const nestedReplies = await populateReplies(reply._id);
          return { ...reply.toObject(), replies: nestedReplies };
        })
      );
    };

    const comments = await Comment.find({
      blog: req.blog._id,
      parentComment: null,
    })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await populateReplies(comment._id);
        return { ...comment.toObject(), replies };
      })
    );

    res.status(200).json({ success: true, comments: commentsWithReplies });
  } catch (error) {
    console.error("[getComments] Error:", error);
    next(error);
  }
};

export const getComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      blog: req.blog._id,
    }).populate("user", "username email");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Can't find comment with the provided id",
      });
    }

    const replies = await Comment.find({ parentComment: commentId })
      .populate("user", "username email")
      .sort({ createdAt: 1 });

    res
      .status(200)
      .json({ success: true, comment: { ...comment.toObject(), replies } });
  } catch (error) {
    console.error("[getComment] Error:", error);
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { text } = req.body || {};
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      blog: req.blog._id,
    }).populate("user", "username email");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Can't find comment with the provided id",
      });
    }

    if (
      comment.user._id.toString() !== req.user._id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    comment.text = text || comment.text;
    comment.edited = true;
    comment.editedAt = new Date().toISOString();

    await comment.save();

    const replies = await Comment.find({ parentComment: commentId })
      .populate("user", "username email")
      .sort({ createdAt: 1 });

    return res
      .status(200)
      .json({ success: true, comment: { ...comment.toObject(), replies } });
  } catch (error) {
    console.error("[updateComment] Error:", error);
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const deleteReplies = req.query.deleteReplies === "true"; // Optional flag to delete replies

    const comment = await Comment.findOne({
      _id: commentId,
      blog: req.blog._id,
    }).populate("user", "username email");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Can't find comment with the provided id",
      });
    }

    console.log("[deleteComment] req.user._id:", req.user._id);
    console.log(
      "[deleteComment] comment.user._id:",
      comment.user._id.toString()
    );

    if (
      comment.user._id.toString() !== req.user._id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // If it's a parent comment and deleteReplies is true, delete its replies
    if (!comment.parentComment && deleteReplies) {
      await Comment.deleteMany({ parentComment: commentId });
      console.log(
        "[deleteComment] Deleted replies for parent comment:",
        commentId
      );
    }

    // Delete the comment itself
    await comment.deleteOne();
    console.log("[deleteComment] Deleted comment:", commentId);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("[deleteComment] Error:", error);
    next(error);
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findOne({
      _id: commentId,
      blog: req.blog._id,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Can't find comment with the provided id",
      });
    }

    const hasLiked = comment.likes.includes(userId);
    if (hasLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      comment.likes.push(userId);
      comment.likeCount = comment.likes.length;
    }

    await comment.save();

    const replies = await Comment.find({ parentComment: commentId })
      .populate("user", "username email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      comment: { ...comment.toObject(), replies },
      message: hasLiked ? "Comment unliked" : "Comment liked",
    });
  } catch (error) {
    console.error("[likeComment] Error:", error);
    next(error);
  }
};
