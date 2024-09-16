const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

//password compartor function
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

mdoule.exports = mongoose.model('UserSchema', UserSchema);