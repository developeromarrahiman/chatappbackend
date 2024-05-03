const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert');
const verifyToken = require('../config/jwt');
router.post('/admin/alert', verifyToken, alertController.createAlertByAdmin);
router.get('/admin/alert', verifyToken, alertController.getAlertsByAdmin);
router.put(
  '/admin/alert/:aid',
  verifyToken,
  alertController.updateAlertByAdmin
);
router.delete(
  '/admin/alert/:aid',
  verifyToken,
  alertController.deleteAlertByAdmin
);
router.get('/alert', verifyToken, alertController.getAlertsByUser);
router.put('/alert/:aid', verifyToken, alertController.updateAlertByUser);
router.delete('/alert/:aid', verifyToken, alertController.deleteAlertByUser);

module.exports = router;
