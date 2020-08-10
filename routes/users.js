const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const { route } = require('.');

//  Login
router.get('/login', (req, res) => res.render('login'));

//  Register
router.get('/register', (req, res) => res.render('register'));

router.post('/register', (req, res) => {
    const {
        name, email, password, password2,
    } = req.body;
    const errors = [];

    //  Check if field is empty
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all the field' });
    }

    // Check password match
    if (password !== password2) {
        errors.push({ msg: 'Password do not match' });
    }

    // Check password length
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters long' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2,
        });
    } else {
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // User already exists
                    errors.push({ msg: 'Email is already registered ' });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    })

                    //Encrypt password
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You have successfully registered');
                                res.redirect('/users/login')
                            })
                            .catch(err => console.log(err));
                    }))
                }
            })
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
      })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You have successfully logged out');
    res.redirect('/users/login');
})

module.exports = router;
