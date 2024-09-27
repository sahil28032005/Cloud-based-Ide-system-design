const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);  //registers new user
router.post('/login', userController.loginUser); //for login user and retun his active token
module.exports = router;