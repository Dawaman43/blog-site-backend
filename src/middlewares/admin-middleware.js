export const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user info" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res
      .status(500)
      .json({ message: "Server error in admin middleware" });
  }
};
