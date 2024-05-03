// chat.controller.js
const Conversation = require('../models/Conversation');
const Chat = require('../models/Chat');
const { getUser } = require('../config/getUser');
const createChat = async (req, res) => {
  try {
    const { isGroup, participants, senderId, title, body } = req.body;
    let chatData = { isGroup, participants };

    if (!Boolean(isGroup)) {
      // If it's not a group chat, set title to undefined
      chatData.title = undefined;
      const otherUser = participants[1];

      const existingChatPromise = Chat.findOne({
        participants: { $all: [req.user._id, otherUser._id] }, // Check for both users
        isGroup: false, // Only consider private chats
      });

      const existingChat = await existingChatPromise;

      if (existingChat) {
        return res
          .status(409) // Conflict status code for existing chat
          .json({
            success: false,
            message: 'Chat already exists with this user.',
          });
      }

      // Set admin as the first participant
    } else {
      // If it's a group chat, set the title
      chatData.title = title;
      // Set admin as the first participant
      chatData.admin = senderId;
    }

    // Create a new chat document
    const chat = await Chat.create(chatData);

    // Create an initial conversation/message if provided

    const conversation = await Conversation.create({
      body,
      chatId: chat._id,
      senderId: senderId, // Assuming the first participant is the sender
      seen: false, // Set seen property to false for the initial conversation
    });
    const message = await Conversation.findById(conversation._id)
      .populate(['senderId'])
      .populate({ path: 'replyTo', select: ['_id', 'body'] });
    chat.messages.push(conversation);
    await chat.save();
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getChatById = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId).populate({
      path: 'conversations',
    });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }
    res.json({ success: true, data: chat });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getChatList = async (req, res) => {
  try {
    const user = await getUser(req, res);
    const allScheduleChats = await Chat.find({ schedule: true });
    // for (const chat of allScheduleChats) {
    //   let hasFutureMessage = false; // Flag to track if there's a message with future date

    //   for (const messageId of chat.messages) {
    //     const message = await Conversation.findById(messageId); // Fetch the message details
    //     if (message && message.date > new Date()) {
    //       hasFutureMessage = true;
    //       break; // Stop iterating messages if a future date is found
    //     }
    //   }

    //   if (!hasFutureMessage) {
    //     await Chat.findByIdAndUpdate(chat._id, { schedule: false });
    //   }
    // }

    const chats = await Chat.find({
      participants: user?._id?.toString(),
      schedule: false,
    })
      .populate([{ path: 'participants' }])
      .populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 1 },
      });

    res.json({ success: true, data: chats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createChat,
  getChatById,
  getChatList,
};
