// user.controller.js
const User = require('../models/User');

const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const searchUser = async (req, res) => {
  try {
    const id = req.user._id;
    const { search } = req.query;
    const users = await User.find({
      $and: [
        { _id: { $ne: id } }, // Exclude the current user
        {
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
          ],
        },
      ],
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await req.body;
    const profile = await User.findByIdAndUpdate(
      userId,
      { ...data },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User Not Found',
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
module.exports = {
  getUserById,
  searchUser,
  updateUser,
};
