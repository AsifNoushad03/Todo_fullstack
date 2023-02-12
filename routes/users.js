var express = require('express');
const bcrypt = require('bcrypt')
var userModel = require('../Models/user')
var router = express.Router();
const alert = require('alert');
/* GET users listing. */
router.get('/signup', function (req, res, next) {
  res.render('users/signup', { viewTitle: 'Signup', title: 'Signup' })
});

router.get('/login', function (req, res, next) {
  res.render('users/login', { viewTitle: 'Login', title: 'Login' })
});

router.post('/signup', (req, res) => {
  signupRecord(req, res);
})
async function signupRecord(req, res) {


  const emailExists = await userModel.findOne({ email: req.body.email });
  if (emailExists) return alert('Email is already Taken')

  const user = new userModel({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    confirm_password: req.body.confirm_password
  });

  // Hash the password
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, async (err, hash) => {
      if (err) throw err;
      user.password = hash;
      user.confirm_password = hash
      user.save((err, doc) => {
        if (!err)
          res.redirect('/users/login')
        else {
          console.log('error ' + err);
        }
      })
    });
  });

}

router.post('/login', async (req, res) => {
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) return alert('Email is incorrect')

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return alert('Password is incorrect')


  if (user && validPassword) {
    req.session.user = user;
    res.redirect('/')
  } else {
    res.redirect('/users/login')
  }
})

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/users/login')
})

module.exports = router;
