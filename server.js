import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectToDB from "./src/db/index.js";
import authRouter from "./src/routes/auth-routers.js";
import blogRouter from "./src/routes/blog-routers.js";
import commentRouter from "./src/routes/comment-routers.js";
import subscriberRouter from "./src/routes/subscriber-routers.js";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

connectToDB();

app.use(
  cors({
    origin: ["https://dawitsblog.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// This ensures Express properly handles preflight requests
app.options("*", cors());

app.use(express.json());

app.use("/api", authRouter);
app.use("/api", subscriberRouter);
app.use("/blogs", blogRouter);
app.use("/blogs", commentRouter);

app.listen(port, () => {
  console.log(`server is now running on ${port}`);
});
