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
    formattedAddress: {
      type: String,
      // required: true,
    },
    latitude: {
      type: Number,
      // required: true,
    },
    longitude: {
      type: Number,
      // required: true,
    },
  },
  category: {
    type: String,
    enum: ['Electrician', 'Plumber','Carpenter',''],
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
    // required: true
  },
  dob: {
    type: Date,
    required: true
  },
  notifications: [{
    message: {
      type: String,
      default: ''
    },
    proposal_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Proposal"
      // required: true,
    },
    client_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User"
      // required: true,
    },

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
