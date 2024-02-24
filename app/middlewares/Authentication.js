const ensureAuthenticated = (req, res, next) => {
    const user = req.session.user;

    if (!user) {
        return res.status(301).redirect('/login');
    }

    next();
};

const ensureNotAuthenticated = (req, res, next) => {
    const user = req.session.user;

    if (user) {
        return res.status(301).redirect('/');
    }

    next();
};

const ensureAuthenticatedAndAdmin = (req, res, next) => {
    const user = req.session.user;

    if(!user) {
        return res.status(301).redirect('/login');
    }

    if(!user.is_admin){
        return res.status(301).redirect('/');
    }

    next();
} 

module.exports = {
    ensureAuthenticated,
    ensureNotAuthenticated,
    ensureAuthenticatedAndAdmin
};