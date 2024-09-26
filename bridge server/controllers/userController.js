const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//registering new user
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        //check weather user already existd or not
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).send({ message: 'user already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(200).send({ success: 'true', message: 'user registered successfully' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

//login user and generrate his token
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({ message: "User not found" });

        ///check weather password match by decoding hash  of perviously stored
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        //generate his token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

//get user by an id
exports.getUserById = async function (req, res) {
    try {
        const user = await User.findById(req.params.id).select('-password');
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }

}

//get user profile as protected route
exports.getUserProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
   
}