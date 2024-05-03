// conversation.controller.js
const Conversation = require('../models/Conversation');
const Chat = require('../models/Chat');

const addMessage = async (req, res) => {
  try {
    const { body, replyTo, senderId } = req.body;
    const { chatId } = req.params;
    const conversation = await Conversation.create({
      body,
      chatId,
      replyTo,
      senderId,
      seen: false, // Set seen property to false for the initial conversation
    });
    const message = await Conversation.findById(conversation._id)
      .populate(['senderId'])
      .populate({ path: 'replyTo', select: ['_id', 'body'] });

    await Chat.findByIdAndUpdate(chatId, {
      $addToSet: { messages: message._id },
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getScheduleMessages = async (req, res) => {
  try {
    const id = req.user._id;

    const messages = await Conversation.find({
      senderId: id,
      schedule: true,
    }).populate({
      path: 'chatId',
      select: ['participants'],
      populate: {
        path: 'participants',
        select: ['name'],
      },
    });

    res.status(201).json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const createScheduleMessage = async (req, res) => {
  try {
    const id = req.user._id;
    const { body, date, user } = req.body;

    const chat = await Chat.create({
      participants: [id, user],
      isGroup: false,
      schedule: true,
    });
    const message = await Conversation.create({
      body,
      chatId: chat._id,
      senderId: id,
      seen: false, // Set seen property to false for the initial conversation
      date,
      schedule: true,
    });

    await Chat.findByIdAndUpdate(chat._id, {
      $addToSet: { messages: message._id },
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updateScheduleMessage = async (req, res) => {
  try {
    const id = req.params.cid;

    const message = await Conversation.findOneAndUpdate(
      { _id: id },
      {
        date: req.body.date,
      }
    );

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const deleteScheduleMessage = async (req, res) => {
  try {
    const id = req.params.cid;
    const message = await Conversation.findById(id);
    await Conversation.findOneAndDelete({ _id: id });
    await Chat.findByIdAndDelete(message.chatId);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMessagesByChatId = async (req, res) => {
  try {
    const { chatId } = req.params;
    const uid = req.user._id;
    const chat = await Chat.findOne({ _id: chatId }).populate('participants');
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: 'Chat not Found!' });
    }
    const conversation = await Conversation.find({ chatId: chatId })
      .populate({ path: 'senderId' })
      .populate({ path: 'replyTo', select: ['_id', 'body'] })
      .sort({
        timestamp: -1,
      });

    const messagesByReceiver = conversation.filter(
      (v) => v?.senderId?._id?.toString() !== uid
    );
    // const lastMessage = messagesByReceiver;

    if (Boolean(messagesByReceiver.length)) {
      const lastMessage = messagesByReceiver[messagesByReceiver.length - 1];
      // console.log(lastMessage, 'lastMessage');
      await Conversation.findOneAndUpdate(
        { _id: lastMessage._id },
        {
          seen: true,
        }
      );
    }
    res.json({
      success: true,
      data: conversation,
      chat: chat,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const deleteMessage = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    // Update the conversation by ID and return the modified document
    const message = await Conversation.findById(conversationId);
    const updatedConversation = await Conversation.findByIdAndDelete(
      conversationId
    );

    if (!updatedConversation) {
      return res
        .status(404)
        .json({ success: false, error: 'Conversation not found' });
    }

    await Chat.findByIdAndUpdate(message.chatId, {
      $pull: { messages: conversationId },
    });

    res
      .status(200)
      .json({ success: true, message: 'Delete Message Successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addMessage,
  getMessagesByChatId,
  deleteMessage,
  createScheduleMessage,
  updateScheduleMessage,
  deleteScheduleMessage,
  getScheduleMessages,
};
