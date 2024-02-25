const express = require('express');
const { ensureAuthenticated, ensureNotAuthenticated } = require('../app/middlewares/Authentication');
const router = express.Router();
const he = require('he');


const User = require('../app/models/User');
const Post = require('../app/models/Post');
const Topic = require('../app/models/Topic');
const Community = require('../app/models/Community');

router.get('/', ensureAuthenticated, async (req, res) => {
    const user = req.session.user;
    const topics = await Topic.find({});
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
    posts.forEach(post => {
        post.comments.sort((a, b) => b.createdAt - a.createdAt);
        post.isLiked = post.upvotes.includes(user.id),
            post.isDisliked = post.downvotes.includes(user.id)
    });

    const context = {
        user: user,
        posts: posts,
        topics: topics
    };

    res.render('user/index', context);
});

router.get("/popular", ensureAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        const topics = await Topic.find({});
        const url = "https://www.reddit.com/hot.json";
        const clientId = 'WHnh_hQN5VUMC2bFG1EkJg';
        const clientSecret = 'NdRk8bbSYsb_dB_4ofoPHD8b7YKl5g';
        const username = 'stagetest2';
        const password = 'Qqwerty1245!';
        const userAgent = 'back-ass-4';
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                'User-Agent': userAgent
            }
        });

        if (!response.ok) {
            console.error(`Error fetching popular posts. Status: ${response.status}`);
            console.error("Response body:", await response.text());
            res.status(response.status).send("Error fetching popular posts");
            return;
        }

        const responsePosts = await response.json();

        // Map each post to a promise that resolves with the post data
        const postPromises = responsePosts.data.children.map(async (post) => ({
            title: post.data.title,
            upvotes: post.data.ups,
            downvotes: post.data.downs,
            createdAt: Date(post.data.created),
            content: post.data.selftext,
            author: post.data.author,
            url: post.data.url,
            topic: post.data.subreddit,
        }));

        // Wait for all post promises to resolve
        const posts = await Promise.all(postPromises);

        const context = {
            user: user,
            posts: posts,
            topics: topics,
        };

        res.render("user/popular", context);
    } catch (error) {
        console.error("Error fetching or processing popular posts:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/login', ensureNotAuthenticated, (req, res) => {
    const user = req.session.user;
    const context = {
        user: user
    };
    res.render('auth/login', context);
});

router.get('/signup', ensureNotAuthenticated, (req, res) => {
    const user = req.session.user;
    const context = {
        user: user
    };
    res.render('auth/signup', context);
});

router.get('/profile/:username', ensureAuthenticated, async (req, res) => {
    try {
        const userParam = req.params.username;
        const user = req.session.user;
        const username = req.params.username;
        const findUser = await User.findOne({ username: userParam }).select('-password');
        if (!findUser) {
            return res.render('user/notfound', { user: user });
        }
        const posts = await Post.find({ author: findUser.id }).populate('author', '-password')
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
        posts.forEach(post => {
            post.comments.sort((a, b) => b.createdAt - a.createdAt);
            post.isLiked = post.upvotes.includes(user.id),
                post.isDisliked = post.downvotes.includes(user.id)
        });
        const communities = await Community.find({ members: findUser.id });
        if (!posts) {
            posts = ['Not found'];
        }
        const context = {
            user: user,
            findUser: findUser,
            posts: posts,
            communities: communities
        }

        res.render('user/profile', context);
    } catch (error) {
        console.log(error);
    }

});

router.get('/about', ensureAuthenticated, async (req, res) => {
    const user = req.session.user;
    const topics = await Topic.find({});
    const context = {
        user: user,
        topics: topics
    }
    res.render('user/about', context);
});

router.get('/topics', ensureAuthenticated, async (req, res) => {
    const user = req.session.user;
    const topics = await Topic.find({});
    const context = {
        user: user,
        topics: topics
    }

    res.render('user/topics', context);
});

router.get('/topics/:topic', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        const topicParam = req.params.topic;
        const topic = await Topic.findOne({ name: topicParam });
        if (!topic) {
            return res.render('user/notfound', { user: user });
        }
        const topics = await Topic.find({});
        const posts = await Post.find({ topic: topic._id })
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
        posts.forEach(post => {
            post.comments.sort((a, b) => b.createdAt - a.createdAt);
            post.isLiked = post.upvotes.includes(user.id),
                post.isDisliked = post.downvotes.includes(user.id)
        });

        const context = {
            user: user,
            topics: topics,
            topic: topic,
            posts: posts
        }

        res.render('user/topic', context);
    } catch (error) {
        console.log(error);
    }
});

router.get('/communities', ensureAuthenticated, async (req, res) => {
    const user = req.session.user;
    const topics = await Topic.find({});
    const communities = await Community.find({});
    const context = {
        user: user,
        topics: topics,
        communities: communities
    }

    res.render('user/communities', context);
});

router.get('/communities/:community', ensureAuthenticated, async (req, res) => {
    try {
        const communityParam = req.params.community;
        const community = await Community.findOne({ name: communityParam });

        if (!community) {
            return res.render('user/notfound', { user: req.session.user });
        }

        const user = req.session.user;
        const topics = await Topic.find({});
        const posts = await Post.find({ community: community._id })
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

        posts.forEach(post => {
            post.comments.sort((a, b) => b.createdAt - a.createdAt);
            post.isLiked = post.upvotes.includes(user.id);
            post.isDisliked = post.downvotes.includes(user.id);
        });

        const context = {
            user: user,
            topics: topics,
            community: community,
            posts: posts
        };

        res.render('user/community', context);
    } catch (error) {
        console.error('Error in /communities/:community route:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/settings', ensureAuthenticated, async (req, res) => {
    const user = req.session.user;
    const topics = await Topic.find({});

    const context = {
        user: user,
        topics: topics
    }

    res.render('user/settings', context);
});

router.get('/weather', ensureAuthenticated, async (req, res) => {
    const user = req.session.user;
    const topics = await Topic.find({});

    const context = {
        user: user,
        topics: topics
    }

    res.render('user/weather', context);
});

router.get('/posts/:post', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        const topics = await Topic.find({});
        const postParam = req.params.post;

        // if (!mongoose.isValidObjectId(postParam)) {
        //     return res.status(400).json({ message: 'Invalid post ID' });
        // }

        const post = await Post.findOne({ _id: postParam })
            .populate('author', '-password')
            .populate('topic')
            .populate('community')
            .populate({
                path: 'comments',
                options: {
                    sort: { createdAt: -1 }
                },
                populate: {
                    path: 'user',
                    select: '-password',
                },
            });

        if (!post) {
            return res.status(404).json({ message: `Post with ID ${postParam} not found` });
        }

        post.comments.sort((a, b) => b.createdAt - a.createdAt);

        const context = {
            user: user,
            post: post,
            isLiked: post.upvotes.includes(user.id),
            isDisliked: post.downvotes.includes(user.id),
            topics: topics
        }

        res.render('user/post', context);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

router.get('/search', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        const search = req.query.search.toLowerCase();
        console.log(search);

        const topics = await Topic.find({});

        const posts = await Post.find({
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { 'author.username': search },
                { 'topic.name': search },
                { 'community.name': search }
            ]
        }).limit(5);

        if (!posts) {
            console.log('Posts not found');
            res.status(404).json({ message: 'Posts with such content not found!' });
        }

        const searchTopics = await Topic.find({ name: { $regex: search, $options: 'i' } }).limit(5);
        if (!searchTopics) {
            console.log('topics not found');
            res.status(404).json({ message: 'Topics with such name not found!' });
        }


        const communities = await Community.find({ name: { $regex: search, $options: 'i' } }).limit(5);
        if (!communities) {
            console.log('communities not found');
            res.status(404).json({ message: 'Communities with such name not found!' });
        }



        const context = {
            user: user,
            topics: topics,
            posts: posts,
            searchTopics: searchTopics,
            communities: communities
        }

        res.render('user/search', context);
    } catch (error) {
        console.log(error);
    }
});
module.exports = router;