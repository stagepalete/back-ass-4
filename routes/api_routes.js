const express = require('express');
const bcrypt = require("bcrypt");
const { ValidatePassword } = require('../app/utils/validation');
const { ensureAuthenticated, ensureNotAuthenticated } = require('../app/middlewares/Authentication');

var router = express.Router();

const User = require('../app/models/User');
const Weather = require('../app/models/Weather');
const Topic = require('../app/models/Topic');
const Community = require('../app/models/Community');
const saltRounds = 10

router.post('/auth/login', ensureNotAuthenticated, async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);


    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Incorrect username or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(404).json({ message: 'Incorrect username or password' });
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            is_admin: user.is_admin,
            createdAt: user.createdAt
        }
        res.status(200).json({ redirect: '/'});
    } catch (error) {
        console.log('Error during login: ', error);
        res.status(500).json({ message: error });
    }
});

router.post('/auth/signup', ensureNotAuthenticated, async (req, res) => {
    const { username, name, lastname, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            name,
            lastname,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        
        res.status(200).json({ redirect: '/login'});
        return;
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/auth/logout', (req, res) => {
    req.session.destroy();
    res.status(200).json({ redirect: '/'});
});

router.get('/profile/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({username}).select('-password');

        if ( !user ) {
            res.status(404).json({message : 'Not found'});
        }

        res.status(200).json({ user }); 
    }catch ( error ){
        console.log(error);
    }
});

router.get('/weather', ensureAuthenticated, async (req, res) => {
    const user = req.session.user;


    const { city } = req.query;


    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=2218b143ab45a7062a46a96f461d5ec7`;
        const response = await fetch(url);
        const weatherData = await response.json();

        const weather = new Weather({
            city: weatherData.name,
            temp: weatherData.main.temp,
            condition: weatherData.weather[0].main,
            user : user._id
        });

        await weather.save();

        res.json(weatherData);
    } catch (err) {
        console.error('Error fetching weather:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/weather/history', ensureAuthenticated, async (req, res) => {
    const user = req.session.user;

    try {
        const history = await Weather.find({ user: user._id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/topics', ensureAuthenticated, async (req, res) => {
    try{
        const topics = await Topic.find({});

        if (!topics) {
            res.status(404).json({message : 'Topics not found!'});
        }

        res.status(200).json({topics});
    }catch(error) {
        console.log(error);
    }
});

router.get('/communities', ensureAuthenticated, async ( req, res ) =>{
    try{
        const communities = await Community.find({});

        if ( !communities ){
            res.status(404).json({message : 'Communities not found!'});
        }

        res.status(200).json({communities});
    }catch(error) {
        console.log(error);
    }
});

router.get('/community/:community', ensureAuthenticated, async ( req, res ) => {
    try{
        const communityParam = req.params.community;
        const community = await Community.findOne({communityParam});

        if ( !community ){
            res.status(404).json({message : 'Community not found!'});
        }

        res.status(200).json({community});
    }catch(error) {
        console.log(error);
    }
});

router.get('/dddd', ensureAuthenticated, async (req, res) => {

});

module.exports = router;