const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Repl=require('./repl');
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },  // Username (unique)
  email: { type: String, required: true, unique: true },     // Email for login
  password: { type: String },                // Hashed password
  avatar: { type: String },                                  // Profile picture URL
  role: { type: String, enum: ['user', 'admin'], default: 'user' },  // Role (user or admin)
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },    // Free or paid plan
  repls: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Repl                                             // Reference to the Repl model
    }
  ],
//   teams: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Team'                                             // Reference to Team model for collaboration
//     }
//   ],
  createdAt: { type: Date, default: Date.now },               // Account creation date
  lastLogin: { type: Date }                                   // Last login timestamp
});

module.exports = mongoose.model('User', userSchema);
