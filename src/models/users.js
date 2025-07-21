import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please fill a valid email address",
      ],
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    password: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
