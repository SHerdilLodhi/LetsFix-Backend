const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
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
        required: true,
      },
    },
  ],

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
        required: true,
      },
    },
  ],
});

const Proposal = mongoose.model("Proposal", proposalSchema);

module.exports = Proposal;
