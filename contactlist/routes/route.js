/**
 * Created by rLevy on 7/13/2017.
 */
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const fs = require('fs');
const multer = require('multer');
// models
const Contact = require('../models/contacts');
const User = require('../models/user');



const storage = multer.diskStorage({
    // destination: function(req, file, cb) {
    //     cb(null, 'uploads')
    // },
    destination: 'uploads',
    filename: function(req, file, cb) {
        // this wil automatically delete the old image.
        cb(null, file.originalname + '-avatar' + '.jpg')

    }
});

const upload = multer({ storage: storage }).single('avatar');
// const upload = multer({ storage: storage }).single();

router.post('/upload_avatar', function(req, res) {

    upload(req, res, function(err) {
        var username = req.file.originalname;
        var path = req.file.path;
        console.log(req.file);
        User.addAvatar(username, path, function(err, user) {
            if (err) {
                throw err
            }
            if (!user) {
                console.log("could not find user");
            }
            console.log(user);
        });
        if (err) {
            // An error occurred when uploading
            throw err;
        }
        res.json({
            sucess: true,
            message: 'Image was uploaded successfully'
        });
        // Everything went fine
        console.log('file uploaded successfully');
    })
});

router.get('/get_avatar', function(req, res, next) {
    User.getUserByUsername(function(err, username) {
        if (err) console.log(err);
        res.json(username);
        console.log("get avatar function : ")
        console.log(username);
    });
});

router.post('/setProfilePic', function(req, res, next) {

});


//retrieving data
// router.get('/contacts', function(req, res, next) {
//     Contact.find(function(err, contacts) {
//         res.json(contacts);
//     })
// });

// //add contact
// router.post('/contacts', function(req, res, next) {
//     var newContact = new Contact({
//         first_name: req.body.first_name,
//         last_name: req.body.last_name,
//         phone: req.body.phone
//     });

//     newContact.save(function(err, contact) {
//         if (err) {
//             res.json({ msg: 'Failed to add contact' })
//         } else {
//             res.json({ msg: 'Contact added successfully' })
//         }
//     })
// });

// //deleting contacts
// router.delete('/contacts/:id', function(req, res, next) {
//     Contact.remove({ _id: req.params.id }, function(err, result) {
//         if (err) {
//             res.json(err);
//         } else {
//             res.json(result);
//         }

//     });
// });

//user login and registration 

// Register
router.post('/register', (function(req, res, next) {
    let newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        avatar: ""
    });

    User.addUser(newUser, function(err, user) {
        if (err) {
            res.json({ success: false, msg: 'Failed to register user' });
        } else {
            res.json({ success: true, msg: 'user was registered' });
        }
    });
}));

router.post('/addImage', function(req, res, next) {

});


router.post('/addFriend', function(req, res, next) {

});

// Authentication
router.post('/authenticate', (function(req, res, next) {
    // user inserts username and password
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, function(err, user) {
        if (err) {
            throw err;
        }
        if (!user) {
            return res.json({ success: false, msg: 'User not found' });
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) {
                throw err;
            }
            if (isMatch) {
                const token = jwt.sign(user, config.secret, {
                        expiresIn: 604800
                    } //1 week
                );
                if (user.avatar) {
                    var avatar = user.avatar;
                } else {
                    var avatar = "";
                }
                return res.json({
                    success: true,
                    token: 'JWT ' + token,
                    user: {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        username: user.username,
                        email: user.email,
                        avatar: avatar
                    }
                });
            } else {
                return res.json({ success: false, msg: 'Wrong password' });
            }
        });
    });
}));

// Profile
// if we want to protect a route we pass the following line as the SECOND PARAMATER
// passport.authenticate('JWT', {session: false})
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.json({ user: req.user });
});


module.exports = router;