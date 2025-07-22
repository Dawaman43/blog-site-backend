import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectToDB from "./src/db/index.js";
import authRouter from "./src/routes/auth-routers.js";
import blogRouter from "./src/routes/blog-routers.js";
import commentRouter from "./src/routes/comment-routers.js";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

connectToDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", authRouter);
app.use("/blogs", blogRouter);
app.use("/", commentRouter);

app.listen(port, () => {
  console.log(`server is now running on ${port}`);
});
