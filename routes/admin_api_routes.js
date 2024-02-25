const express = require('express');
const { ValidatePassword } = require('../app/utils/validation');
const { ensureAuthenticatedAndAdmin, ensureAuthenticated } = require('../app/middlewares/Authentication');
const { communityAvaUpload, communitiesTopAvaUpload, topicAvaUpload, profileAvaUpload } = require('../app/middlewares/FileUpload');

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


router.post('/api/users/delete/:username', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const { username } = req.params;

        // Find the user to be deleted
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user's posts if any
        await Post.deleteMany({ author: user._id });

        // Find user's posts to get related topic IDs
        const posts = await Post.find({ author: user._id });
        const topicIds = posts.map(post => post.topic);

        // Delete user's topics if any
        await Topic.deleteMany({ _id: { $in: topicIds } });

        // Delete user's communities if any
        await Community.deleteMany({ creator: user._id });

        // Finally, delete the user
        await User.findOneAndDelete({ username: username });

        res.status(200).json({ message: 'User and related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




router.post('/api/users/update/:user', ensureAuthenticatedAndAdmin, profileAvaUpload.single('avatar'), async (req, res) => {
    try {
        const currentUser = req.session.user;
        const user = req.params.user;
        const { username, name, lastname, email, country, city, isadmin } = req.body;
        const avatar = req.file ? req.file.filename : undefined;
        const data = {
            location: [{}]
        }

        if (username) {
            data.username = username
        }
        if (name) {
            data.name = name
        }
        if (lastname) {
            data.lastname = name
        }
        if (email) {
            data.email = email
        }
        if (country) {
            data.location[0].country = country;
        }
        if (city) {
            data.location[0].city = city;
        }
        if (isadmin) {
            if (isadmin == 'on') {
                data.is_admin = true
            }
        } else {
            data.is_admin = false
        }
        if (avatar) {
            data.avatar = `/media/user_profile/${avatar}`
        }

        console.log(data)

        const updatedUser = await User.findOneAndUpdate(
            { _id: user },
            { $set: data },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (currentUser.id == user) {
            if (username) {
                req.session.user.username = username
            }
            if (name) {
                req.session.user.name = name
            }
            if (lastname) {
                req.session.user.lastname = name
            }
            if (email) {
                req.session.user.email = email
            }
            if (country) {
                req.session.user.country = country
            }
            if (city) {
                req.session.user.city = city
            }
            if (isadmin) {
                if (isadmin == 'on') {
                    req.session.user.is_admin = true
                }
            } else {
                req.session.user.is_admin = false
            }
            if (avatar) {
                req.session.user.avatar = `/media/user_profile/${avatar}`
            }
            res.status(200).redirect(`/admin/users/`);
        } else {
            res.status(200).redirect(`/admin/users/`);
        }


    } catch (error) {
        console.log(error);
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

router.post('/api/topics/add', ensureAuthenticatedAndAdmin, topicAvaUpload.single('ava'), async (req, res) => {
    try {
        const { name } = req.body;
        const ava = req.file ? req.file.filename : undefined;
        if (!name || !ava) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const topic = new Topic({
            image: `/media/topics_ava/${ava}`,
            name: name
        });

        const savedTopic = await topic.save();

        if (!savedTopic) {
            return res.status(500).json({ message: 'Failed to create topic' });
        }

        res.status(200).redirect('/admin/topics');
    } catch (error) {
        console.error('Error adding topic:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




router.post('/api/topics/edit/:topic', ensureAuthenticatedAndAdmin, topicAvaUpload.single('topicAva'), async (req, res) => {
    try {
        const topicParam = req.params.topic;
        console.log(topicParam);
        const { topicName } = req.body;
        const topicAva = req.file ? req.file.filename : undefined;
        const data = {}
        if (topicName) {
            data.name = topicName
        }
        if (topicAva) {
            data.image = `/media/topics_ava/${topicAva}`
        }

        const topic = await Topic.findOneAndUpdate({ name: topicParam }, data, { new: true })

        if (!topic) {
            return res.status(500).json({ message: 'Topic not found' });
        }

        res.status(200).redirect('/admin/topics');
    } catch (error) {
        console.error('Error editing topic:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/api/topics/delete/:topic', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const topicParam = req.params.topic;

        const posts = await Post.find({}).populate('topic');

        const postsToDelete = posts.filter(post => post.topic.name === topicParam);

        await Post.deleteMany({ _id: { $in: postsToDelete.map(post => post._id) } });


        const topic = await Topic.findOneAndDelete({ name: topicParam });

        if (topic) {
            res.status(200).redirect('/admin/topics');
        } else {
            res.status(200).json({ message: 'Topic not found' });
        }
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).json({ message: 'Internal server error' });
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

router.post('/api/communities/add', ensureAuthenticatedAndAdmin, communityAvaUpload.single('ava'), async (req, res) => {
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
        return res.status(200).redirect('/admin/communities');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
});

router.post('/api/communities/edit/:community', ensureAuthenticatedAndAdmin, communityAvaUpload.fields([{ name: 'communityAva', maxCount: 1 }, { name: 'communityTopAva', maxCount: 1 }]), async (req, res) => {
    try {
        const communityParam = req.params.community;
        const { communityName, communityDescription, communityRules } = req.body;

        const communityAva = req.files['communityAva'] ? req.files['communityAva'][0].filename : undefined;
        const communityTopAva = req.files['communityTopAva'] ? req.files['communityTopAva'][0].filename : undefined;

        const data = {}

        if (communityName) {
            data.name = communityName;
        }
        if (communityDescription) {
            data.description = communityDescription;
        }
        if (communityRules) {
            data.rules = communityRules.split(',');
        }
        if (communityAva) {
            data.comunityAva = `/media/communities_ava/${communityAva}`; // Assuming 'filename' property contains the file name
        }
        if (communityTopAva) {
            data.comunityTopAva = `/media/communities_top_ava/${communityTopAva}`; // Assuming 'filename' property contains the file name
        }
        const community = await Community.findOneAndUpdate(
            { name: communityParam },
            data,
            { new: true }
        );

        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        res.status(200).redirect('/admin/communities');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.patch('/api/communities/:community', async (req, res) => {
    try {
        const { name, description, moderators, communityAva, communityTopAva, rules } = req.body;
        const communityParam = req.params.community;
        let data = {};

        if (name) {
            data.name = name;
        }
        if (description) {
            data.description = description;
        }
        if (moderators) {
            // Assuming moderators is an array of user IDs
            data.moderators = moderators; // Use set to replace existing moderators
        }
        if (communityAva) {
            data.comunityAva = communityAva;
        }
        if (communityTopAva) {
            data.comunityTopAva = communityTopAva;
        }
        if (rules) {
            data.rules = rules;
        }
        console.log(data);
        const community = await Community.findOneAndUpdate({ name: communityParam }, data, { new: true });

        if (community) {
            res.status(200).json({ message: `Community ${communityParam} changed successfully!`, changedFields: data, community: community });
        } else {
            res.status(404).json({ message: `Community ${communityParam} not found!` });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.delete('/api/communities/:community', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const communityParam = req.params.community;

        const community = await Community.findOneAndDelete({ name: communityParam });

        if (!community) {
            res.status(404).json({ message: `Community ${communityParam} not found!` });
        }

        res.status(200).json({ message: `Community ${communityParam} deleted successfully` });
    } catch (error) {
        console.log(error);
    }
});
// POSTS
router.get('/api/posts', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate('author', '-password')
            .populate('topic')
            .populate('community')
            .populate('comments');;
        if (!posts) {
            res.status(404).json({ message: 'Posts not found' });
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log(error);
    }
});
router.get('/api/posts/:post', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const postParam = req.params.post;

        const post = await Post.find({ _id: postParam });

    } catch (error) {
        console.log(error);
    }
});
router.post('/posts/add', ensureAuthenticatedAndAdmin, async (req, res) => {
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
router.post('/api/posts/edit/:post', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const user = req.session.user;
        const postParam = req.params.post;
        const { title, content, topic, community } = req.body;
        console.log(postParam);
        const data = {
        }

        if (title) {
            data.title = title
        }
        if (content) {
            data.content = content
        }
        if (topic) {
            data.topic = topic
        }
        if (community) {
            data.community = community
        }

        console.log(data);

        const post = await Post.findOneAndUpdate(
            { _id: postParam },
            data,
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json({ message: 'success' });


    } catch (error) {
        console.log(error);
    }
});

router.post('/api/posts/delete/:post', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const user = req.session.user;

        const postParam = req.params.post;

        const post = await Post.findOneAndDelete({ _id: postParam });

        if (!post) {
            res.status(404).json({ message: "Not found!" });
        }

        res.status(200).json({ message: 'success' });
    } catch (error) {
        console.log(error);
    }
})
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


router.post('/api/weather/delete/:weather', ensureAuthenticatedAndAdmin, async (req, res) => {
    try {
        const user = req.session.user;
        const weatherParam = req.params.weather;

        const weather = await Weather.findOneAndDelete({
            _id: weatherParam
        });

        if (!weather) {
            res.status(404).json({ message: 'Not found' });
        }

        res.status(200).json({ message: 'success' });
    } catch (error) {
        console.log(error);
    }
});


module.exports = router;