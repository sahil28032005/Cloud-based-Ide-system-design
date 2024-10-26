const express = require('express');
const PORT = process.env.PORT || 5002;
const cors = require('cors'); // Import the cors modul
const app = express();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');
const redisClient=require('./config/redis');
var jwt = require('jsonwebtoken');

app.use(cors({
    origin: 'http://localhost:5173', // Update this to your frontend's URL
    credentials: true, // Allow credentials (e.g., cookies, authorization headers)
})); // Allow all origins (for development only)
// Import Routes
const userRoutes = require('./routes/userRoutes');
const replRoutes = require('./routes/replRoutes');
const teamRoutes = require('./routes/teamRoute');
const sessionRoutes = require('./routes/sessionRoutes');

const connectDB = require('./config/db');
const User = require('./models/user');

//json data middleware
app.use(express.json());
app.use(session({ secret: "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", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());



connectDB();
//define routes here
app.use('/api/users', userRoutes);  // User routes
app.use('/api/repls', replRoutes);   // Repl routes
// app.use('/api/teams', teamRoutes);  // Team routes
// app.use('/api/sessions', sessionRoutes);  // Session routes
// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: "639991296859-k3jp8rerfu2lkcuqd9c50q90ahqp3ch5.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:5002/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        // Handle user profile info here (find or create user in DB)
        try {
            //check weather user already exists or not
            console.log("saver phase");
            let user = await User.findOne({ email: profile.emails[0].value });

            //if user not exists create him as newl entrty
            if (!user) {
                user = new User({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    // password: await bcrypt.hash(profile.id, 10),
                    avatar: profile.photos[0].value
                });

                //save user record
                await user.save();
                console.log("user created");
            }
            else {
                console.log("already exists user record");
            }
            return done(null, user);
        }
        catch (err) {
            done(err, null);
        }
    }
));

// Serialize user by their MongoDB _id
passport.serializeUser((user, done) => {
    done(null, user._id);  // Serialize the MongoDB user's _id
});

// Deserialize user by their MongoDB _id
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);  // Find user by _id
        done(null, user);  // Pass the user object to the next middleware
    } catch (err) {
        done(err, null);
    }
});

//main authhenticator callback
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

//success and faliure redirects callbaks
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function async(req, res) {
        // Successful authentication, redirect success.
        console.log('req', req.user._id);

        //generate hwt auth token for normal securty
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
          
        // res.status(200).json({
        //     token: token,
        //     user: {
        //         id: req.user.id,
        //         username: req.user.displayName,
        //         email: req.user.emails[0].value,
        //         avatar: req.user.photos[0].value,
        //     }
        // });

        const redirectUrl = `http://localhost:5173/auth/callback?token=${token}&userId=${req.user._id}&username=${req.user.username}&email=${req.user.email}&avatar=${req.user.avatar}`;
        res.redirect(redirectUrl); // Redirecting with query params
    });

//server starter code
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});