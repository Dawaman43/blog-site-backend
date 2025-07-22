import bcrypt from "bcrypt";
import User from "../models/users.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  console.log("req.body =>", req.body);

  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Must fill in the form body",
      });
    }

    //check if there is existing email in the database
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message:
          "There is existing email with the provided email on the database",
      });
    }

    //Encrypt the password with the bcrypt
    const salt = await bcrypt.genSalt(10);
    const encryptPassword = await bcrypt.hash(password, salt);

    //register the user
    const createNewUser = await User.create({
      username,
      email,
      password: encryptPassword,
      role,
    });

    //return to user
    return res.status(201).json({
      success: true,
      message: "user registered successfully",
      user: {
        id: createNewUser._id,
        username: createNewUser.username,
        email: createNewUser.email,
        role: createNewUser.role,
      },
    });
  } catch (error) {
    next(error);
    console.log("Error => ", error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Must fill in the form body",
      });
    }

    //check if user is registered
    const existingEmail = await User.findOne({ email });
    if (!existingEmail) {
      return res.status(400).json({
        success: false,
        message:
          "User didn't find with the provided email. Please register first to login",
      });
    }

    //decrypt the password
    const isPasswordMatch = await bcrypt.compare(
      password,
      existingEmail.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Wrong password. please try again",
      });
    }

    //Create a token to user when login
    const payload = {
      id: existingEmail._id,
      username: existingEmail.username,
      email: existingEmail.email,
      role: existingEmail.role,
    };
    console.log(payload);

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    //return the result to user
    return res.status(200).json({
      success: true,
      message: "User logged successfully",
      token,
      user: {
        id: existingEmail._id,
        username: existingEmail.username,
        email: existingEmail.email,
        role: existingEmail.role,
      },
    });
  } catch (error) {
    next(error);
    console.log("Error => ", error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find({}, "-password -__v");

    return res.status(200).json({
      success: true,
      message: "Success fetching all users",
      allUsers,
    });
  } catch (error) {
    next(error);
    console.log("Error => ", error);
  }
};
