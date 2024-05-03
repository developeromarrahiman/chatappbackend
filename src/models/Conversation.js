const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    body: {
      type: String,
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    seen: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
    },
    schedule: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
