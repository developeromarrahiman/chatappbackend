const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const alertSchema = new Schema(
  {
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'saved', 'canceled'],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
