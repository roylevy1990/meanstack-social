const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const UserSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        data: Buffer,
        contetTpye: String,
        path: String
    },
    friends_list: {
        type: []
    }

});

// mongodb://localhost:27017/contactlist
const User = module.exports = mongoose.model('User', UserSchema);

module.exports.addAvatar = function(username, path, callback) {
    User.findOneAndUpdate({ username: username }, { $set: { avatar: path } }, { new: true }, function(err, doc) {
        if (err) {
            console.log("couldnt update avatar for username " + username);
        }
        console.log(doc);
    })
}



module.exports.getUserById = function(id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback) {
    const query = { username: username }
    User.findOne(query, callback);
}

module.exports.addUser = (newUser, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
        console.log("in genSalt...")
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            console.log("in hash....")
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}