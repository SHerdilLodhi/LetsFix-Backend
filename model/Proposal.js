const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  
  title: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: 'idol',
  },

  location: {
    formattedAddress: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  photos: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        // required: true,
      },
    },
  ],
  invited: {
    worker_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    accepted: {
      type: Boolean,
      default: false,
    },
  },
  bids: [
    {
      worker_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      coverletter: {
        type: String,
        // required: true,
      },
      Date: {
        type: Date,
        default: Date.now,
      }
    },
  ],
},{timestamps: true});

const Proposal = mongoose.model("Proposal", proposalSchema);

module.exports = Proposal;