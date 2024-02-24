const express = require('express');
const { ValidatePassword } = require('../app/utils/validation');
const { ensureAuthenticatedAndAdmin } = require('../app/middlewares/Authentication');


var router = express.Router();


const User = require('../app/models/User');
const Weather = require('../app/models/Weather');
const Topic = require('../app/models/Topic');
const Community = require('../app/models/Community');
const Post = require('../app/models/Post');



// USERS

router.get('/api/users', ensureAuthenticatedAndAdmin, async (req, res) => {

    try {
        const users = await User.find({});

        if (!users) {
            res.status(404).json({ message: 'Users not found' });
        }

        res.status(200).json(users);
    } catch (error) {
        console.log(error);
    }

});

router.get('/api/users/:user', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const userParam = req.params.user;
        const user = await User.findOne({ userParam });

        if (!user) {
            res.status(404).json({ message: `User ${userParam} not found` });
        }

        res.status(200).json(user);
    } catch (error) {
        console.log(error);
    }
});

router.post('/api/users/add', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const { username, name, lastname, email, password } = req.body;

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

        res.status(200).json({ message: 'New user created successfully' });
    } catch (error) {
        console.error('Error adding new user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.patch('/api/users/:user', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const { user } = req.params;
        const { username, name, lastname, email, password } = req.body;

        const updatedUser = await User.findOneAndUpdate({ username: user }, { username, name, lastname, email, password }, { new: true });

        if (updatedUser) {
            res.status(200).json({ user: updatedUser });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.delete('/api/users/:user', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOneAndDelete({ username: username });

        if (user) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// TOPICS

router.get('/api/topics', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const topics = await Topic.find({});

        if (!topics) {
            res.status(404).json({ message: `Topics not found!` });
        }

        res.status(200).json(topics);
    } catch (error) {
        console.log(error);
    }
});

router.get('/api/topics/:topic', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const topicParam = req.params.topic;

        const topic = await Topic.find({ topicParam });

        if (!topic) {
            res.status(404).json({ message: `Topic ${topicParam} not found` });
        }

        res.status(200).json(topic);
    } catch (error) {
        console.log(error);
    }
});

router.post('/api/topics/add', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const { image, name } = req.body;

        if (!image || !name) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const topic = new Topic({
            image: image,
            name: name
        });

        const savedTopic = await topic.save();

        if (!savedTopic) {
            return res.status(500).json({ message: 'Failed to create topic' });
        }

        res.status(200).json(savedTopic);
    } catch (error) {
        console.error('Error adding topic:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.patch('/api/topics/:topic', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const topicParam = req.params.topic;
        const { image, name } = req.body;
        const topic = await Topic.findOneAndUpdate({ name: topicParam }, { image: image, name: name }, { new: true });
        if (!topic) {
            res.status(500).json({ message: 'Something went wrong!' });
        }

        res.status(200).json(topic);
    } catch (error) {
        console.log(error);
    }
});

router.delete('/api/topics/:topic', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const topicParam = req.params.topic;

        const topic = Topic.findOneAndDelete({ name: topicParam });

        if (topic) {
            res.status(200).json({ message: `Topic ${topicParam} deleted successfully` });
        } else {
            res.status(404).json({ message: `Topic ${topicParam} not found!` });
        }
    } catch (error) {
        console.log(error);
    }
});

// Communities

router.get('/api/communities', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const communities = await Community.find({});

        if (!communities) {
            res.status(404).json({ message: 'Communities not found!' });
        }
        res.status(200).json(communities);
    } catch (error) {
        console.log(error);
    }
});

router.get('/api/communities/:community', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const communityParam = req.params.community;

        const community = await Community.findOne({ name: communityParam });

        if (!community) {
            res.status(404).json({ message: `Community ${communityParam} not found` });
        }

        res.status(200).json(community);
    } catch (error) {
        console.log(error);
    }
});

router.post('/api/communities/add', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const { name, description, creator } = req.body;

        if (!name || !description || !creator) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const community = new Community({
            name: name,
            description: description,
            creator: creator
        });

        const savedCommunity = await community.save();

        if (!savedCommunity) {
            return res.status(500).json({ message: 'Failed to create community' });
        }

        res.status(200).json({ message: `Community ${name} created successfully`, community: savedCommunity });
    } catch (error) {
        console.error('Error creating community:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.patch('/api/communities/:community', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const { name, description, moderators, comunityAva, comunityTopAva, rules, posts } = req.body;
        const communityParam = req.params.community;

        const community = await Community.findOneAndUpdate({ name: communityParam }, {
            name: name,
            description: description,
            moderators: moderators,
            comunityAva: comunityAva,
            comunityTopAva: comunityTopAva,
            rules: rules,
        }, { new: true });

        if (community) { 
            res.status(200).json({message : `Community ${communityParam} changed successfully!`, community: community});
        }else{
            res.status(404).json({message: `Community ${communityParam} not found!`});
        }
    } catch (error) {
        console.log(error);
    }
});

router.delete('/api/communities/:community', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const communityParam = req.params.community;

        const community = await Community.findOneAndDelete({name : communityParam});

        if(!community) {
            res.status(404).json({message : `Community ${communityParam} not found!`});
        }

        res.status(200).json({message : `Community ${communityParam} deleted successfully`});
    } catch (error) {
        console.log(error);
    }
});

// POSTS

router.get('/api/posts', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
    }
});

router.get('/api/posts/:post', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
    }
});

router.post('/api/posts/add', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
    }
});

router.patch('/api/posts/:post', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
    }
});

router.delete('/api/posts/:post', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
    }
});

// Comment

router.get('/api/comments/:post', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
    }
});

router.delete('/api/comments/:comment', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
    }
});


module.exports = router;