const express = require('express');
const bcrypt = require("bcrypt");
const { ValidatePassword } = require('../app/utils/validation');
const { ensureAuthenticated, ensureNotAuthenticated } = require('../app/middlewares/Authentication');
const { profileAvaUpload, communityAvaUpload } = require('../app/middlewares/FileUpload');

var router = express.Router();

const User = require('../app/models/User');
const Weather = require('../app/models/Weather');
const Topic = require('../app/models/Topic');
const Community = require('../app/models/Community');
const Post = require('../app/models/Post');
const saltRounds = 10

router.post('/auth/login', ensureNotAuthenticated, async (req, res) => {
    const { username, password } = req.body;


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
            country: user.location.couuntry,
            city: user.location.city,
            is_admin: user.is_admin,
            createdAt: user.createdAt
        }
        res.status(200).json({ redirect: '/' });
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
            username: username,
            name: name,
            lastname: lastname,
            avatar: '',
            email: email,
            location: {
                country: '',
                city: ''
            },
            password: hashedPassword,
        });

        await newUser.save();

        res.status(200).json({ redirect: '/login' });
        return;
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/auth/logout', (req, res) => {
    req.session.destroy();
    res.status(200).json({ redirect: '/' });
});

router.get('/get-holidays', async (req, res) => {
    try {
        const date = new Date();
        const year = date.getFullYear();
        const api = 'wWCrCrIWCuo6ZWewRqZzEo7JoPYWAAzv';
        const url = `https://calendarific.com/api/v2/holidays?&api_key=${api}&country=KZ&year=${year}`;
        const data = await fetch(url);
        const responses = await data.json();
        const holidays = responses.response.holidays;
        const needed = [];

        const currentTime = Date.now();

        holidays.forEach(holiday => {
            const holidayTime = new Date(holiday.date.iso).getTime(); // Convert holiday date to milliseconds
            if (currentTime < holidayTime) {
                needed.push(holiday);
            }
        });
        
        res.status(200).json(needed);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
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
            user: user.id
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
    try {
        const topics = await Topic.find({});

        if (!topics) {
            res.status(404).json({ message: 'Topics not found!' });
        }

        res.status(200).json({ topics });
    } catch (error) {
        console.log(error);
    }
});

router.get('/communities', ensureAuthenticated, async (req, res) => {
    try {
        const communities = await Community.find({});

        if (!communities) {
            res.status(404).json({ message: 'Communities not found!' });
        }

        res.status(200).json({ communities });
    } catch (error) {
        console.log(error);
    }
});

router.get('/community/:community', ensureAuthenticated, async (req, res) => {
    try {
        const communityParam = req.params.community;
        const community = await Community.findOne({ communityParam });

        if (!community) {
            res.status(404).json({ message: 'Community not found!' });
        }

        res.status(200).json({ community });
    } catch (error) {
        console.log(error);
    }
});

router.post('/community/:community/join', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        // const {user} = req.body
        console.log(user);
        const communityParam = req.params.community;
        const community = await Community.findOneAndUpdate({ name: communityParam }, { $push: { members: user.id } }, { new: true });

        if (!community) {
            res.status(404).json({ message: 'Community not found!' });
        }

        if (community.members.includes(user.id)) {
            res.status(400).json({ message: 'User already have membership in this community' });
        }
        res.status(200).json(community);
    } catch (error) {
        console.log(error);
    }
})

router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find({});

        if (!posts) {
            res.status(404).json({ message: 'Posts not found' });
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log(error);
    }
});


router.post('/posts/:post/comment/add', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        const postParam = req.params.post;
        const { comment } = req.body;

        const post = await Post.findOneAndUpdate(
            { _id: postParam },
            { $push: { comments: { user: user.id, comment: comment } } },
            { new: true }
        )
            .populate('author', '-password')
            .populate('topic')
            .populate('community')
            .populate({
                path: 'comments',
                options: {
                    sort: { createdAt: 1 }
                },
                populate: {
                    path: 'user',
                    select: '-password',
                },
            });

        if (!post) {
            return res.status(404).json({ message: `Post ${postParam} not found` });
        }

        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/posts/:post/downvote/add', ensureAuthenticated, async (req, res) => {
    try {
        const postParam = req.params.post;
        const user = req.session.user

        const post = await Post.findOneAndUpdate(
            { _id: postParam },
            { $push: { downvotes: user.id } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: `Post ${postParam} not found` });
        }

        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/posts/:post/downvote/delete', ensureAuthenticated, async (req, res) => {
    try {
        const postParam = req.params.post;
        const user = req.session.user

        const post = await Post.findOneAndUpdate(
            { _id: postParam },
            { $pull: { downvotes: user.id } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: `Post ${postParam} not found` });
        }

        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/posts/:post/upvote/delete', ensureAuthenticated, async (req, res) => {
    try {
        const postParam = req.params.post;
        const user = req.session.user;

        const post = await Post.findOneAndUpdate(
            { _id: postParam },
            { $pull: { upvotes: user.id } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: `Post ${postParam} not found` });
        }
        res.status(200).json(post);
    } catch (error) {
        console.log(error)
    }
})

router.post('/posts/:post/upvote/add', ensureAuthenticated, async (req, res) => {
    try {
        const postParam = req.params.post;
        const user = req.session.user

        const post = await Post.findOneAndUpdate(
            { _id: postParam },
            { $push: { upvotes: user.id } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: `Post ${postParam} not found` });
        }

        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/posts/:post/downvote/add', ensureAuthenticated, async (req, res) => {
    try {
        const postParam = req.params.post;
        const user = req.session.user
        // const user = req.body

        const post = await Post.findOneAndUpdate(
            { _id: postParam },
            { $push: { downvotes: user._id } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: `Post ${postParam} not found` });
        }

        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/posts/add', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        const { title, content, topic, community } = req.body;

        if (!title || !content || !topic || !community) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const data = {
            title: title,
            content: content,
            topic: topic,
            author: user.id,
            community: community,
        }
        console.log(data);

        const post = new Post({
            title: title,
            content: content,
            topic: topic,
            author: user.id,
            community: community,
            comments: [],
            upvotes: [],
            downvotes: []
        });

        const savedPost = await post.save();

        if (!savedPost) {
            return res.status(500).json({ message: 'Failed to create post' });
        }

        res.status(200).json({ message: `Post ${title} created successfully`, post: savedPost });

    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/auth/edit-profile', ensureAuthenticated, profileAvaUpload.single('avatar'), async (req, res) => {
    try {
        const user = req.session.user;
        const { name, lastname, country, city } = req.body;
        const avatar = req.file ? req.file.filename : undefined; // Check if a file was uploaded
        const data = {

        };
        if (name) {
            data.name = name
        }
        if (lastname) {
            data.lastname = lastname
        }
        if (country) {
            data.location = {}
            data.location.country = country
        }
        if (avatar) {
            data.avatar = `/media/user_profile/${avatar}`;
        }
        if (city) {
            data.location.city = city
        }


        // Update the user's profile data in the database
        const updatedUser = await User.findOneAndUpdate(
            { username: user.username },
            { $set: data },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (name) {
            req.session.user.name = name
        }
        if (lastname) {
            req.session.user.lastname = lastname
        }
        if (country) {
            req.session.user.country = country
        }
        if (avatar) {
            req.session.user.avatar = `/media/user_profile/${avatar}`;
        }
        if (city) {
            req.session.user.city = city
        }

        res.status(200).redirect(`/profile/${updatedUser.username}`);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/communities/add', ensureAuthenticated, communityAvaUpload.single('ava'), async (req, res) => {
    try {
        const user = req.session.user;
        const { name, description } = req.body;
        const ava = req.file ? req.file.filename : undefined;
        const data = {
            creator: user.id,
            moderators: [],
            comunityTopAva: '',
            members: [user.id],
            rules: [],
        };


        if (name) {
            data.name = name;

            const existingName = await Community.findOne({ name: name });
            if (existingName) {
                return res.status(400).json({ message: 'Community with such name already exists!' });
            }
        }
        if (description) {
            data.description = description;
        }
        if (ava) {
            data.comunityAva = `/media/communities_ava/${ava}`;
        }
        const newCommunity = new Community(data);
        const community = await newCommunity.save();
        if (!community) {
            return res.status(500).json({ message: 'Something went wrong' });
        }
        return res.status(200).redirect('/communities');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
});


module.exports = router;