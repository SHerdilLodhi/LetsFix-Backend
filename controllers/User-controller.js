const User = require("../model/User");
const Proposal = require("../model/Proposal");
const formatBufferTo64 = require("../utils/FormatBuffer");
const cloudinary = require('cloudinary');
const uuidv4 = require("uuid");
const { ObjectId } = require('mongodb');
const moment = require("moment-timezone");

//Signup User
//doneeeeee
exports.UserSignup = async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Check if the email is already taken
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Check if the phone number is already taken
    const phoneExists = await User.findOne({ phone: phone });
    if (phoneExists) {
      return res.status(400).json({ error: "Phone number already exists" });
    }

    // Create a new user object
    const newUser = new User(req.body);
    // Save the new user to the database
    const savedUser = await newUser.save();

    res.status(200).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//Login User
//doneeeeee
exports.UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid  password!" });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Upload/ADD Proposal  do pictures wala part
//doneeeeee
exports.UploadPorposal = async (req, res) => {
  try {


    const { user, title, location, price, description, date } = req.body;
    let picturePath = []
    for (let i = 0; i < req.files.length; i++) {
      const file64 = formatBufferTo64(req.files[i]);
      let file = await cloudinary.v2.uploader.upload(file64.content, {
        folder: "proposalImages",
      });
      picturePath.push(file)
    }
    const proposal = new Proposal({
      user,
      title,
      location,
      price,
      description,
      photos: picturePath,
      date
    });
    await proposal.save();
    res.status(201).json(proposal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Show uploaded proposals (Proposals On Board)-> user
//doneeeeee
exports.ProposalsOnBoard = async (req, res) => {
  try {
    const userId = req.body.user;
    const proposals = await Proposal.find({ user: userId }).where('user').equals(userId).populate('acceptedForWorker_id', 'username dp category'); // Use populate to fetch the user's name and dp
    res.status(200).json(proposals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Rating api (worker/ client)

exports.rating = async (req, res) => {
  try {
    const { proposalId, raterId, rating, professionalism, behaviour, skills, toberated_User } = req.body;

    // Find the User
    const toberated_user = await User.findById(toberated_User);
    if (!toberated_user) {
      return res.status(404).json({ message: 'User to be rated not found' });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if the rater is a client or worker
    const rater = await User.findById(raterId);
    if (!rater) {
      return res.status(404).json({ message: 'Rater not found' });
    }

    if (rater.type === 'Worker') {
      // Rating for client
      if (!toberated_user.ratingClient) {
        toberated_user.ratingClient = []; // Initialize as an empty array
      }
      
      toberated_user.ratingClient.push({
        rating,
        rater_id: raterId,
        proposal_id_of_session: proposalId,
        date: moment().tz("Asia/Karachi").format() // Store current date in PKT
      });
    } else if (rater.type === 'Client') {
      // Rating for worker
      if (!toberated_user.ratingworker) {
        toberated_user.ratingworker = []; // Initialize as an empty array
      }
      toberated_user.ratingworker.push({
        professionalism,
        behaviour,
        skills,
        rater_id: raterId, 
        proposal_id_of_session: proposalId,
        date: moment().tz("Asia/Karachi").format() // Store current date in PKT
      });
    } else {
      return res.status(400).json({ message: 'Invalid rater type' });
    }
    
    // Update the proposal status to "completed" and set the date
    proposal.status = 'completed';
    proposal.completedAt = moment().tz("Asia/Karachi").format(); // Store completed date in PKT
    await proposal.save();
    
    if(rater.type=="Worker"){
      proposal.clientRate = true;
      await proposal.save();
    }else if(rater.type=="Client"){
      proposal.workerRate = true;
      await proposal.save();
    }
    // Save the updated user
    await toberated_user.save();

    res.status(200).json({ message: `Rating added successfully for user: ${toberated_user.username}` });
    console.log("Rated user:", toberated_user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};













//Proposal Detail -> User
//doneeeeee

exports.ProposalDetail = async (req, res) => {
  const id = req.body._id;
  try {
    const proposal = await Proposal.findById(id)
      .populate({
        path: 'bids.worker_id',
        model: 'User',
        select: '-password',
        populate: {
          path: 'dp',
          model: 'ProfilePicture',
          select: 'url',
        },
      })
      .exec();

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    console.log(proposal);
    res.json(proposal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


//PDModal onclick api -> User
exports.AcceptBid = async (req, res) => {
  try {
    const { userId, proposalId, workerId } = req.body;
    const user = await User.findById(userId);
    const proposal = await Proposal.findById(proposalId);
    // const foundBId = new ObjectId(proposal.bids.worker_id);
    // console.log("proposal:",foundBId)
    const bid = proposal.bids.find(
      (bid) => bid.worker_id
      // (bid) => bid.worker_id.toString() === userId
    );


    if (!user) {
      return (
        res.status(404)
          .json({ message: "User not found." })
      )
    }
    if (!proposal) {
      return (
        res.status(404)
          .json({ message: "proposal not found." })
      )
    }
    if (!bid) {
      return (
        res.status(404)
          .json({ message: "bid not found." })
      )
    }

    const worker = await User.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: "Worker not found." });
    }

    const message = `Congrats! your bid has been accepted on proposal ${proposal.title}.`;
    console.log(proposal._id);
    worker.notifications.push({ message, proposal_id: proposal._id.toString(), link: `/workavailable/workdetail/${proposal._id}` });
    await worker.save();
    proposal.status = "accepted";
    await proposal.save();
    proposal.acceptedForWorker_id = worker._id; //worker whose bid is accepted
    await proposal.save();
    return res.status(200).json({
      message: "Notification created successfully.",

    });
  } catch (error) {
    return res.status(500).json({ message: error.message })
    // console.error(error.message)

  }
};



//getporposal through notification (Worker)
exports.GetProposal = async (req, res) => {
  const proposalId = req.params.id;

  try {
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(proposal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

//Fetching proposal by id 

exports.FetchProposalbyid = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the proposal by ID
    const proposal = await Proposal.findById(id)
      .populate('user', 'username')
      .populate('acceptedForWorker_id', 'username')
      .populate('invited.worker_id', 'username')
      .populate('bids.worker_id', 'username');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    res.status(200).json({ proposal });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};






//worker own bid find  (worker)


exports.GetBidByWorkerId = async (req, res) => {
  try {
    const { proposalId, workerId } = req.body;

    const proposal = await Proposal.findById(proposalId)
      .populate("bids.worker_id")
      .select("bids");

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found." });
    }

    const bid = proposal.bids.find(
      (bid) => bid.worker_id.toString() === workerId
    );

    if (!bid) {
      return res.status(404).json({ message: "Bid not found for the given worker." });
    }

    res.json(bid);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};



// get work -> when enters location hits this api (WORKER)
//doneeeeee
exports.GetWork = async (req, res) => {
  const { formattedAddress } = req.body;

  try {
    const proposals = await Proposal.find({
      'location.formattedAddress': { $regex: formattedAddress, $options: 'i' },
    })
      .populate({
        path: 'bids.worker_id',
        select: 'username dp',
        model: 'User',
      })
      .exec();

    res.json({ proposals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};



// Upload DP / Profile Picture
//doneeeeee

exports.UploadDP = async (req, res) => {

  try {

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.dp?.public_id) {
      await cloudinary.v2.uploader.destroy(user.dp.public_id)
    }


    const file64 = formatBufferTo64(req.files[0]);
    let file = await cloudinary.v2.uploader.upload(file64.content, {
      folder: "ProfilePictures",
    });

    user.dp = file
    let dp = await user.save();

    res.status(201).json({ dp: dp.dp });
  }
  catch (error) {
    console.log(error.message)
  }


}
// Workers Available (User)



exports.WorkersAvailable = async (req, res) => {
  try {
    const { category, location } = req.body;
    const categoryRegex = new RegExp(category || "all", "i");
    const locationRegex = new RegExp(location, "i");

    // Update user's location in the database
    await User.updateMany({}, { $set: { location: { formattedAddress: location } } });

    const workers = await User.find({
      category: categoryRegex,
      location: locationRegex,
    });

    res.status(200).json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.findWorkers = async (req, res) => {
  try {
    const { category, location } = req.body;

    const locationRegex = new RegExp(location, 'i');

    const workers = await User.find({
      category: category,
      'location.formattedAddress': { $regex: locationRegex },
    });

    res.json({ workers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};





// Add Bid to proposal (Worker Will Add Bid)  -> (WORKER)
//doneeeeee
exports.AddBid = async (req, res) => {
  const { proposalId, worker_id, price, coverletter, dp  } = req.body;

  try {
    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    // Find the worker who placed the bid
    const worker = await User.findById(worker_id);

    const newBid = { worker_id, price, coverletter, worker  };
    proposal.bids.push(newBid);
    await proposal.save();

    // Find the user (client) associated with the proposal
    const client = await User.findById(proposal.user);



    // Create a notification for the client
    const notification = {
      message: `A bid has been added by ${worker.username}`,
      proposal_id: proposalId,
      client_id: proposal.user,
      worker_id: worker_id,
      dp: dp////////////////
    };

    // Add the notification to the client's notifications array
    let link = `/proposaldetail/${proposalId}`;
    notification.link = link
    client.notifications.push(notification);
    await client.save();

    // Fetch the worker's details
    const workerDetails = await User.findById(worker_id);

    res.json({ proposal, bidder: workerDetails });
  } catch (err) {
    console.error(err);
    // res.status(500).json({ error: "Server error" });
  }
};



exports.RequestWork = async (req, res) => {
  try {
    const { userId, workerId, user } = req.body;

    const worker = await User.findById(workerId);
    const notification = {
      message: `${user.username} has requested you to work`,
      client_id: userId,
      proposal_id: workerId,
    };
    worker.notifications.push(notification);
    await worker.save();

    // Send a success response
    res.status(200).json({ message: `you have recieved a request for work from user ${user.username}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

//Given Bids (WORKER)
//doneeeeee
exports.GivenBids = async (req, res) => {
  try {
    const workerId = req.body.workerId;
    const proposals = await Proposal.find({ "bids.worker_id": workerId })
      .populate({
        path: "bids.worker_id",
        select: "-notifications -password",
        populate: {
          path: "dp",
          select: "public_id url"
        }
      })
      .populate({
        path: "user",
        select: "username",
        populate: {
          path: "dp",
          select: "public_id url"
        }
      });

    const matchingBid = proposals.map((proposal) => proposal.bids.filter(bid => bid.worker_id.toString() === workerId));

    res.json({ proposals, matchingBid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};




//user location update
exports.updateUserLocation = async (req, res) => {
  try {
    const { userId, formattedAddress } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the formatted address
    user.location.formattedAddress = formattedAddress;

    // Save the updated user
    await user.save();

    res.json({ message: "User location updated successfully.", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};



// Update user / edit profile
exports.EditProfile = async (req, res) => {
  const {
    _id: userId,
    username,
    type,
    location,
    category,
    phone,
    email,
    gender,
    dp,
    dob,
    password
  } = req.body;

  try {
    // Check if email already exists for other users
    const existingEmailUser = await User.findOne({
      email: email,
      _id: { $ne: userId } // Exclude the current user from the check
    });

    if (existingEmailUser) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    // Check if phone number already exists for other users
    // Check if phone number already exists for other users
    const existingPhoneUser = await User.findOne({
      phone: phone,
      _id: { $ne: userId } // Exclude the current user from the check
    });

    if (existingPhoneUser && existingPhoneUser._id.toString() !== userId) {
      return res.status(400).json({ error: 'Phone number already exists.' });
    }
    // Find and update the user
    const user = await User.findByIdAndUpdate(userId, {
      $set: {
        username,
        type,
        location,
        category,
        phone,
        email,
        gender,
        dp,
        dob,
        password
      }
    }, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error.' });
  }
};



//FORGOT PASSWORD


exports.forgotPassword =
  async (req, resp, next) => {

    try {
      let email = await User.findOne({ email: req.body.email })

      if (!email) { return resp.status(404).json({ success: false, message: "User Not Found" }) }

      const resetToken = uuidv4.v4();
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      email.resetPasswordToken = resetToken;
      email.resetPasswordExpires = resetTokenExpiry;
      const resetURL = `http://localhost:3000/resetPassword/${resetToken}`;

      const sendMail = require('../utils/Mail');
      await sendMail({
        from: "lodhisherdil1@gmail.com", to: req.body.email, subject: "Incineration", text: `Reset Password`, html: require('../utils/Template')({
          link: resetURL
        })
      })
      await email.save();
      resp.status(200).json({ success: true, message: "Reset Link Sent" })

    } catch (error) {
      await User.updateOne({ email: req.body.email }, { $set: { resetPasswordToken: null, resetPasswordExpires: null } })
      resp.status(500).json({ success: false, message: error.message })
    }


  }
//RESET PASSWORD

exports.resetPassword =
  async (req, resp, next) => {

    let token = req.params.uuid;
    let isValiduuidToken = uuidv4.validate(token);

    if (!isValiduuidToken) { return resp.status(500).json({ success: false, message: "Password Cannot be changed right now" }) }

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) { return resp.status(404).json({ success: false, message: "Password Cannot be changed right now" }) }
    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null
    await user.save();

    resp.status(201).json({ success: true, message: "Password Updated" })

  }
