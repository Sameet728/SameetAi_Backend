const express = require("express");
const router = express.Router();
const Chat = require("../models/Chats");

const User = require('../models/User');
const jwt = require('jsonwebtoken');


// Route to save a chat
router.post("/chat", async (req, res) => {
  const { userId, question, answer } = req.body;

  // Validate request body
  if (!userId || !question || !answer) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find the chat history for the user
    let chat = await Chat.findOne({ userId });

    // If no chat history exists, create a new document
    if (!chat) {
      chat = new Chat({ userId, chats: [] });
    }

    // Add the new question-answer pair to the chat history
    chat.chats.push({ question, answer });

    // Save the chat document
    await chat.save();

    res.status(201).json({ message: "Chat saved successfully", chat });
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Route to fetch all chats for a specific user
router.get("/chats/:userId", async (req, res) => {
  const { userId } = req.params;

try {
  // Find the chat history for the user
  const chat = await Chat.findOne({ userId });

  // If no chats exist for the user, return an empty array
  if (!chat) {
    return res.status(200).json({ chats: [] }); // Return empty array instead of 404 error
  }

  res.status(200).json(chat);
} catch (error) {
  console.error("Error fetching chats:", error);
  res.status(500).json({ message: "Server error", error: error.message });
}

});

// Route to delete a specific chat by ID
router.delete("/chats/:userId/:chatId", async (req, res) => {
  const { userId, chatId } = req.params;

  try {
    // Find the chat history for the user
    const chat = await Chat.findOne({ userId });

    if (!chat) {
      return res.status(404).json({ message: "No chats found for this user" });
    }

    // Filter out the chat to be deleted
    chat.chats = chat.chats.filter((c) => c._id.toString() !== chatId);

    // Save the updated chat document
    await chat.save();

    res.status(200).json({ message: "Chat deleted successfully", chat });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Route to clear all chats for a user
router.delete("/chats/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the chat history for the user
    const chat = await Chat.findOne({ userId });

    if (!chat) {
      return res.status(404).json({ message: "No chats found for this user" });
    }

    // Clear the chats array
    chat.chats = [];

    // Save the updated chat document
    await chat.save();

    res.status(200).json({ message: "All chats cleared successfully", chat });
  } catch (error) {
    console.error("Error clearing chats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
