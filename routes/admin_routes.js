const express = require('express');
const { ValidatePassword } = require('../app/utils/validation');
const { ensureAuthenticatedAndAdmin } = require('../app/middlewares/Authentication');


var router = express.Router();

const User = require('../app/models/User');
const Topic = require('../app/models/Topic');
const Community = require('../app/models/Community');
const Post = require('../app/models/Post');
const Weather = require('../app/models/Weather');
const History = require('../app/models/History');


router.get('/', ensureAuthenticatedAndAdmin, (req, res) => {
    const user = req.session.user;
    const context = {
        user: user
    }
    res.render('admin/dashboard', context);
});

router.get('/history', ensureAuthenticatedAndAdmin, (req, res) => {
    const user = req.session.user;
    const context = {
        user: user
    }
    res.render('admin/history', context);
});

router.get('/weather', ensureAuthenticatedAndAdmin, async (req, res) => {
    const user = req.session.user;
    const weathers = await Weather.find({}).populate('user').select('-password');
    const context = {
        user: user,
        weathers: weathers
    }
    res.render('admin/weather', context);
});

router.get('/topics', ensureAuthenticatedAndAdmin, async (req, res) => {
    const user = req.session.user;
    const topics = await Topic.find({});
    const context = {
        user: user,
        topics: topics
    }
    res.render('admin/topics', context);
});

router.get('/users', ensureAuthenticatedAndAdmin, async (req, res) => {
    const user = req.session.user;
    const users = await User.find({});
    const context = {
        user: user,
        users : users
    }
    res.render('admin/users', context);
});

router.get('/communities', ensureAuthenticatedAndAdmin, async (req, res) => {
    const user = req.session.user;
    const communities = await Community.find({});
    const context = {
        user: user,
        communities: communities
    }
    res.render('admin/communities', context);
});

router.get('/posts', ensureAuthenticatedAndAdmin, async (req, res) => {
    const user = req.session.user;
    const posts = await Post.find({})
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
        }).sort('-createdAt');
    const topics = await Topic.find({});
    const communities = await Community.find({});
    const context = {
        user: user,
        posts: posts,
        topics : topics,
        communities : communities
    }
    res.render('admin/posts', context);
});


router.get('/activities', ensureAuthenticatedAndAdmin, async(req, res) => {
    const user = req.session.user;
    const history = await History.find({})
    .populate('user').populate('target');

    const context = {
        user : user,
        history : history
    }
    res.render('admin/activities',  context)
})







module.exports = router;