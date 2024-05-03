const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    isGroup: {
      type: Boolean,
      default: false,
    },

    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
    },
    schedule: {
      type: Boolean,
      default: false,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
module.exports = Chat;
