
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const verifyToken = require("../config/jwt");

router.get('/users',verifyToken, userController.searchUser);

router.get('/users/:userId',verifyToken, userController.getUserById);

router.put('/users/:userId',verifyToken, userController.updateUser);



module.exports = router;
