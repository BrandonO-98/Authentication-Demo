const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String, 
    required: [true, 'Username cannot be blank'],
  },  
  hashPassword: {
    type: String, 
    required: [true, 'Password cannot be blank'],
  },  
})
 // this referes to the model
userSchema.statics.findAndValidate = async function(username, password) {
  const foundUser = await this.findOne({username})
  const isValid = await bcrypt.compare(password, foundUser.hashPassword)
  return isValid ? foundUser : false
} 

// this refers to the instance, middleware runs everytime save is called
userSchema.pre('save', async function(next) {
  // If the password field is not changed don't rehash.
  if(!this.isModified('hashPassword')) return next()
  this.hashPassword = await bcrypt.hash(this.hashPassword, 12)
  next()
})

module.exports = mongoose.model('User', userSchema)