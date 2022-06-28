const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path');
const bcrypt = require('bcrypt')
const session = require('express-session')
const User = require('./models/userModel')

mongoose.connect('mongodb://localhost:27017/authDemo')
.then(()=> {
  console.log("Mongo Connection Open!")
})
.catch(err => {
  console.log("Mongo Error!")
  console.log(err)
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(session({ 
  secret: 'notagoodsecret',   
  resave: false,
  saveUninitialized: false 
}))

const requireLogin = (req, res, next) => {
  if (!req.session.userid) {
    return res.redirect('/login')
  }
  next()
}

app.get('/', (req, res, next) => {
  res.send('Home')
})

app.get('/register', (req, res, next) => {
  res.render('register')
})

app.get('/login', (req, res, next) => {
  res.render('login')
})

app.post('/register', async (req, res, next) => {
  const {username , password} = req.body
  const user = new User({
    username, 
    hashPassword: password
  }) 
  await user.save()
  req.session.userid = user._id
  res.redirect('/')
})

app.post('/login', async (req, res, next) => {
  const {username , password} = req.body
  const user = await User.findAndValidate(username, password)
  if (user) {
    // after a successful login, store the user id in session
    req.session.userid = user._id
    res.send('Welcome!')
  }
  else {
    res.send('User or password incorrect!')
  }
})

app.post('/logout', (req, res, next) => {
  req.session.userid = null;
  res.redirect('/login')
})

app.get('/secret', requireLogin, (req, res, next) => {
  res.render('secret')
})

app.get('/topsecret', requireLogin, (req, res, next) => {
  res.send('Top secret')
})

app.listen(3000, () => {
  console.log('Listening on Port 3000')
})
