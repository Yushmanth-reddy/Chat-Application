import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
export const signup = async (req, res) => {
  const { email, fullName, password } = req.body;
  try {
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "lenght of password must be greater than 6" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(200).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilepic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "invalid user id" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Insernal server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPassCorrect = await bcrypt.compare(password, currentUser.password);
    if (!isPassCorrect) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    generateToken(currentUser._id, res);
    res.status(200).json({
      _id: currentUser._id,
      fullName: currentUser.fullName,
      email: currentUser.email,
      profilepic: currentUser.profilePic,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successful" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilepic } = req.body;
    const userId = req.user._id;
    if (!profilepic) {
      return res.status(400).json({ message: "Profile pic required" });
    }

    const uploadresponse = await cloudinary.uploader.upload(profilepic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadresponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};
