const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const replSchema = new Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',                                             // Owner of the Repl (User)
    required: true
  },
  name: { type: String, required: true },                    // Name of the Repl (e.g., "My Python App")
  description: { type: String },                             // Optional description
  containerId: { type: String, required: true },             // Docker container ID
  language: { type: String, required: true },                // Programming language (e.g., Python, Node.js)
  version: { type: String },                                 // Language version (e.g., "14.17.0" for Node.js)
  environment: {                                             // Environment variables for the container
    type: Map,
    of: String
  },
  status: { type: String, enum: ['running', 'stopped'], default: 'stopped' },  // Status of the container
  ipAddress: { type: String },                               // IP Address assigned to the container
  port: { type: Number },                                    // Port for accessing the repl
  // files: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'File'                                            // Reference to the File model
  //   }
  // ],
  metadata: {
    type: Map,
    of: String                                               // Arbitrary key-value pairs for repl metadata
  },
  visibility: { type: String, enum: ['private', 'public'], default: 'private' },  // Repl visibility (public/private)
  createdAt: { type: Date, default: Date.now },              // Repl creation date
  lastUpdated: { type: Date }                                // Last updated timestamp
});

module.exports = mongoose.model('Repl', replSchema);
