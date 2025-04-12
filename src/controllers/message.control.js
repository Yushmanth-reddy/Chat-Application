import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInuserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInuserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userToChatId = req.params.id;
    const loggedInuserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: loggedInuserId, recieverId: userToChatId },
        { senderId: userToChatId, recieverId: loggedInuserId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const userToChatId = req.params.id;
    const loggedInuserId = req.user._id;

    let imageURL;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageURL = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId: loggedInuserId,
      recieverId: userToChatId,
      text,
      image: imageURL,
    });

    await newMessage.save();
    // implement socket.io
    const recieverSocketId = getRecieverSocketId(userToChatId);
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};
