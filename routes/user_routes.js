const express = require('express');
const { ensureAuthenticated, ensureNotAuthenticated } = require('../app/middlewares/Authentication');
const router = express.Router();

const User = require('../app/models/User');

router.get('/', (req, res) => {
    const user = req.session.user;
    const context = {
        user: user
    };
    res.render('user/index', context);
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
        const user = req.session.user;
        const username = req.params.username;
        const findUser = await User.findOne({ username }).select('-password');
        const context = {
            user: user,
            findUser: findUser
        }

        res.render('user/profile', context);
    } catch (error) {
        console.log(error);
    }

});

router.get('/about', ensureAuthenticated, (req, res) => {
    const user = req.session.user;
    const context = {
        user: user,
     }
    res.render('user/about', context);
});

router.get('/topics', ensureAuthenticated, (req,res) => {
    const user = req.session.user;

    const context = {
        user : user
    }

    res.render('user/topics', context);
});

router.get('/topics/:topic', ensureAuthenticated, async (req, res) =>{
    
});

router.get('/communities', async (req, res) =>{
    const user = req.session.user;

    const context = {
        user : user
    }

    res.render('user/communities', context);
});

router.get('/communities/:community', async (req, res) => {
    const user = req.session.user;

    const context = {
        user : user
    }
    
    res.render('/user/community', context);
});

router.get('/popular', ensureAuthenticated, async (req, res) =>{
    const user = req.session.user;

    const context = {
        user : user
    }

    res.render('user/index', context);
});

router.get('/settings', ensureAuthenticated, async (req, res) => {
    const user = req.session.user;

    const context = {
        user : user
    }

    res.render('user/settings', context);
});

router.get('/weather', ensureAuthenticated, async (req, res) => {
    const user = req.session.user;

    const context = {
        user : user
    }

    res.render('user/weather', context);
});

module.exports = router;