const express = require('express');
const PORT = process.env.PORT || 5000;
const app = express();

// Import Routes
const userRoutes = require('./routes/userRoutes');
const replRoutes = require('./routes/replRoutes');
const teamRoutes = require('./routes/teamRoute');
const sessionRoutes = require('./routes/sessionRoutes');

const connectDB=require('./config/db');

//json data middleware
app.use(express.json());

connectDB();
//define routes here
app.use('/api/users', userRoutes);  // User routes
// app.use('/api/repls', replRoutes);  // Repl routes
// app.use('/api/teams', teamRoutes);  // Team routes
// app.use('/api/sessions', sessionRoutes);  // Session routes

//server starter code
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});