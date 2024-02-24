const express = require('express');
const { ValidatePassword } = require('../app/utils/validation');
const { ensureAuthenticatedAndAdmin } = require('../app/middlewares/Authentication');


var router = express.Router();



router.get('/', ensureAuthenticatedAndAdmin, (req, res) => {
    const user = req.session.user;
    const context = {
        user : user
    }
    res.render('admin/dashboard', context);
});

router.get('/history', ensureAuthenticatedAndAdmin, (req, res) => {
    const user = req.session.user;
    const context = {
        user : user
    }
    res.render('admin/history', context);
});

router.get('/weather', ensureAuthenticatedAndAdmin, (req, res) => {
    const user = req.session.user;
    const context = {
        user : user
    }
    res.render('admin/weather', context);
});

router.get('/topics', ensureAuthenticatedAndAdmin, (req, res) => {
    const user = req.session.user;
    const context = {
        user : user
    }
    res.render('admin/topics', context);
});

router.get('/users', ensureAuthenticatedAndAdmin, (req, res) => {
    const user = req.session.user;
    const context = {
        user : user
    }
    res.render('admin/users', context);
});

router.get('/communities', ensureAuthenticatedAndAdmin, (req, res) => {
    const user = req.session.user;
    const context = {
        user : user
    }
    res.render('admin/communities', context);
});

router.get('/posts', ensureAuthenticatedAndAdmin, (req, res) => {
    const user = req.session.user;
    const context = {
        user : user
    }
    res.render('admin/posts', context);
});










module.exports = router;