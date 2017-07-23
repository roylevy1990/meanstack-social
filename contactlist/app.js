// importing modules
const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const app = express();
const route = require('./routes/route');
const config = require('./config/database')
    //connect to mongodb
mongoose.connect(config.database);

//on connection
mongoose.connection.on('connected', function() {
    console.log("Connected to database mongodb @ 27017")
});


mongoose.connection.on('error', function(err) {
    if (err) {
        console.log('Error in Database connection:' + err)
    }
});

//port no
const port = process.env.PORT || 8080;

//adding middleware - cors
app.use(cors());

//body - parser
app.use(bodyparser.json());

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

//static files
app.use(express.static(path.join(__dirname, 'public')));

//routes
app.use('/api', route);

//testing
app.get('/', function(req, res) {
    res.send('foobar');
});

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.listen(port, function() {
    console.log('Server started at port :' + port);
});