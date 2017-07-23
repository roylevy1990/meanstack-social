/**
 * Created by rLevy on 7/13/2017.
 */
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
// models
const Contact = require('../models/contacts');
const User = require('../models/user');
//retrieving data
router.get('/contacts', function(req, res, next) {
    Contact.find(function(err, contacts) {
        res.json(contacts);
    })
});

//add contact
router.post('/contacts', function(req, res, next) {
    var newContact = new Contact({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone
    });

    newContact.save(function(err, contact) {
        if (err) {
            res.json({ msg: 'Failed to add contact' })
        } else {
            res.json({ msg: 'Contact added successfully' })
        }
    })
});

//deleting contacts
router.delete('/contacts/:id', function(req, res, next) {
    Contact.remove({ _id: req.params.id }, function(err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }

    });
});

//user login and registration 

// Register
router.post('/register', (function(req, res, next) {
    let newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    });

    User.addUser(newUser, function(err, user) {
        if (err) {
            res.json({ success: false, msg: 'Failed to register user' });
        } else {
            res.json({ success: true, msg: 'user was registered' });
        }
    });
}));


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

                return res.json({
                    success: true,
                    token: 'JWT ' + token,
                    user: {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        username: user.username,
                        email: user.email
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