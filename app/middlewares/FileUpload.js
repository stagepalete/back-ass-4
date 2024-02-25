const multer = require('multer');
const path = require('path');

const profileAvaStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/media/user_profile'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const communitiesAvaStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/media/communities_ava')); 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const communitiesTopAvaStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/media/communities_top_ava')); 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const topicAvaStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/media/topics_ava')); 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})


const profileAvaUpload = multer({ storage: profileAvaStorage });
const communityAvaUpload = multer({storage : communitiesAvaStorage});
const communitiesTopAvaUpload = multer({storage : communitiesTopAvaStorage});
const topicAvaUpload = multer({storage : topicAvaStorage});
module.exports = {
    profileAvaUpload,
    communityAvaUpload,
    communitiesTopAvaUpload,
    topicAvaUpload
};
