const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const Alert = require('../models/Alert');
const createUser = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const { name, email, image, password } = req.body;
    const user = await User.create({
      name,
      email,
      image,
      password,
      role: Boolean(totalUsers) ? 'user' : 'admin',
    });
    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: Boolean(totalUsers) ? 'user' : 'admin',
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );
    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = await req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User Not Found' });
    }

    if (!user.password) {
      return res
        .status(404)
        .json({ success: false, message: 'User Password Not Found' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect Password' });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );
    const alert = await Alert.findOne({
      user: user._id,
      status: 'pending',
    }).populate({ path: 'user' });
    return res.status(201).json({
      success: true,
      message: 'Login Successfully',
      data: {
        token,
        user,
        alert,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const request = await req.body;
    const user = await User.findOne({ email: request.email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User Not Found ' });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    // Constructing the link with the token
    const resetPasswordLink = `${request.origin}/auth/reset-password?token=${token}`;

    // Path to the HTML file
    const htmlFilePath = path.join(
      process.cwd(),
      'src/email-templates',
      'forget-password.html'
    );

    // Read HTML file content
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    htmlContent = htmlContent.replace(
      /href="javascript:void\(0\);"/g,
      `href="${resetPasswordLink}"`
    );
    // Create nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.RECEIVING_EMAIL, // Your Gmail email
        pass: process.env.EMAIL_PASSWORD, // Your Gmail password
      },
    });

    // Email options
    let mailOptions = {
      from: process.env.RECEIVING_EMAIL, // Your Gmail email
      to: user.email, // User's email
      subject: 'Verify your email',
      html: htmlContent, // HTML content with OTP and user email
    };

    // Send email synchronously
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Forgot password email sent successfully.',
      data: token,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Error sending email.' });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = await req.body;

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token. Please request a new one.',
      });
    }

    // Find the user by ID from the token
    const user = await User.findById(decoded._id).select('password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User Not Found ',
      });
    }
    if (!newPassword || !user.password) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid data. Both newPassword and user.password are required.',
      });
    }

    // Check if the new password is the same as the old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from the old password.',
      });
    }
    // Update the user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: 'Password Updated Successfully.',
      data: user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  forgetPassword,
  resetPassword,
};
