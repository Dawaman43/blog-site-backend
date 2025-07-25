import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("[authMiddleware] Received token:", token ? "Present" : "Absent");

  if (!token) {
    if (
      req.method === "PATCH" &&
      req.path.includes("/blogs") &&
      req.path.includes("/view")
    ) {
      req.user = null;
      return next();
    }
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("[authMiddleware] Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("[authMiddleware] Verification error:", err);
    if (err.name === "TokenExpiredError") {
      if (
        req.method === "PATCH" &&
        req.path.includes("/blogs") &&
        req.path.includes("/view")
      ) {
        req.user = null;
        return next();
      }
      return res
        .status(401)
        .json({ message: "Token expired", expiredAt: err.expiredAt });
    }
    res.status(401).json({ message: "Invalid token" });
  }
};
