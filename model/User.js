const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Worker', 'Client'],
    required: true
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    }
  },
  category: {
    type: String,
    enum: ['Electrician', 'Plumber','Carpenter'],
  },
  phone: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  dp: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  notifications: [{
    message: {
      type: String,
      default: ''
    }
  }],
  password: {
    type: String,
    required: true
  }
  ,
  rating: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
