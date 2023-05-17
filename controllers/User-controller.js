const User = require("../model/User");
const Proposal = require("../model/Proposal");
const formatBufferTo64 = require("../utils/FormatBuffer");
const cloudinary = require ("cloudinary");
//Signup User
//doneeeeee
exports.UserSignup = async (req, res) => {
  try {
    const { email } = req.body;
    // Check if the email is already taken
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
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

    
    const { user,title, location, price, description,date } = req.body;
    let picturePath=[]
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
    const proposals = await Proposal.find({ user: userId }).where('user').equals(userId);
    res.status(200).json(proposals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




//Proposal Detail -> User
//doneeeeee
exports.ProposalDetail = async (req, res) => {
  const id = req.body._id;
  try {
    const proposal = await Proposal.findById(id);
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
    const { userId, proposalId } = req.body;
    console.log(proposalId);
    const user = await User.findById(userId);
    const proposal = await Proposal.findById(proposalId);
    const bid = proposal.bids.find(
      (bid) => bid.worker_id.toString() === userId
    );

    if (!user || !proposal || !bid) {
      return res
        .status(404)
        .json({ message: "User, proposal, or bid not found." });
    }

    const message = `You have a new notification regarding your bid on proposal ${proposal.title}.`;
    console.log(proposal._id);
    user.notifications.push({ message, proposal_id: proposal._id.toString() });
    await user.save();
    proposal.status = "accepted";
    await proposal.save();
    return res
      .status(200)
      .json({ message: "Notification created successfully." , proposal_id: proposal._id.toString() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// get work -> when enters location hits this api (WORKER)
//doneeeeee
exports.GetWork = async (req, res) => {
  const { formattedAddress } = req.body;

  try {
    const proposals = await Proposal.find({
      "location.formattedAddress": { $regex: formattedAddress, $options: "i" },
    });

    res.json({ proposals });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
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
    
    if(user.dp?.public_id){
      await cloudinary.v2.uploader.destroy(user.dp.public_id)
    }
    
    
    const file64 = formatBufferTo64(req.files[0]);
    let file = await cloudinary.v2.uploader.upload(file64.content, {
      folder: "ProfilePictures",
    });
    
    user.dp = file 
    let dp = await user.save();
    
    res.status(201).json({dp:dp.dp});
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
    const workers = await User.find({
      category: categoryRegex,
      location: locationRegex,
    });
    res.status(200).json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};







// Add Bid to proposal (Worker Will Add Bid)  -> (WORKER)
//doneeeeee
exports.AddBid = async (req, res) => {
  const { proposalId, worker_id, price, coverletter,dp } = req.body;

  try {
    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    const newBid = { worker_id, price, coverletter };
    proposal.bids.push(newBid);
    await proposal.save();

    // Find the user (client) associated with the proposal
    const client = await User.findById(proposal.user);

    // Find the worker who placed the bid
    const worker = await User.findById(worker_id);

    // Create a notification for the client
    const notification = {
      message: `A bid has been added by ${worker.username}`,
      proposal_id: proposalId,
      client_id: proposal.user,
      worker_id: worker_id,
      dp: dp////////////////
    };

    // Add the notification to the client's notifications array
    client.notifications.push(notification);
    await client.save();

    // Fetch the worker's details
    const workerDetails = await User.findById(worker_id);

    res.json({ proposal, bidder: workerDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



exports.RequestWork = async (req, res) => {
  try {
    const { userId, workerId } = req.body;

    const worker = await User.findById(workerId);
    const notification = {
      message: `User ${userId} has requested you to work`,
      client_id: userId,
      proposal_id: workerId,
    };
    worker.notifications.push(notification);
    await worker.save();

    // Send a success response
    res.status(200).json({ message: `you have recieved a request for work from user ${userId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

//Given Bids (WORKER)
//doneeeeee
exports.GivenBids =async (req, res) => {
  try {
    const workerId = req.body.workerId;
    const proposals = await Proposal.find({ "bids.worker_id": workerId })
    // .populate('user').populate('invited.worker_id').populate('bids.worker_id');
    res.json(proposals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

//
