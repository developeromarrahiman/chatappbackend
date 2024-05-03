const Alert = require('../models/Alert');
const createAlertByAdmin = async (req, res) => {
  try {
    const alert = await Alert.create({ ...req.body });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const getAlertsByAdmin = async (req, res) => {
  try {
    const alerts = await Alert.find().populate({ path: 'user' });

    res.status(201).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const getAlertsByUser = async (req, res) => {
  try {
    const user = req.user;

    if (user.role === 'admin') {
      const alerts = await Alert.find({}).populate({ path: 'user' });
      res.status(201).json({
        success: true,
        data: alerts,
      });
    } else {
      const alerts = await Alert.find({
        user: user._id,
        status: 'saved',
      }).populate({
        path: 'user',
      });

      res.status(201).json({
        success: true,
        data: alerts,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updateAlertByAdmin = async (req, res) => {
  try {
    const { aid } = req.params;
    const alert = await Alert.findByIdAndUpdate(aid, { ...req.body });
    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updateAlertByUser = async (req, res) => {
  try {
    const { aid } = req.params;
    const alert = await Alert.findOneAndUpdate(
      { _id: aid },
      { status: 'saved' }
    );
    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const deleteAlertByAdmin = async (req, res) => {
  try {
    const id = req.user._id;
    const { aid } = req.params;
    await Alert.findOneAndDelete({ _id: aid, user: id });
    res.status(201).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const deleteAlertByUser = async (req, res) => {
  try {
    const { aid } = req.params;
    await Alert.findOneAndDelete({ _id: aid });
    res.status(201).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  createAlertByAdmin,
  getAlertsByAdmin,
  updateAlertByAdmin,
  deleteAlertByAdmin,
  getAlertsByUser,
  updateAlertByUser,
  deleteAlertByUser,
};
