const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createRepl, getReplById, updateRepl, deleteRepl } = require('../controllers/replController');

//routes are protected vial middleware
router.post('/create-repel', authMiddleware,createRepl);
router.post('/get-repel', authMiddleware,getReplById);
router.post('/update-repel', authMiddleware,updateRepl);
router.post('/delete-repel', authMiddleware,deleteRepl);

module.exports = router;