const User = require("../model/User");
const Proposal = require("../model/Proposal")
//Signup User

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

exports.UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

//Upload Proposal  do pictures wala part

exports.UploadPorposal = async (req, res) => {
  try {
    const { user, location, price, description, photos } = req.body;
    const proposal = new Proposal({ user, location, price, description, photos });
    await proposal.save();
    res.status(201).json(proposal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Show uploaded proposals (Bids On Board)-> user

exports.ProposalsOnBoard = async (req, res) => {
  try {
    const userId = req.body.user;
    const proposals = await Proposal.find({ user: userId });
    res.status(200).json(proposals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// get work -> when enters location hits this api (WORKER)

exports.GetWork = async (req, res) => {
  const { location } = req.body;

  try {
    const proposals = await Proposal.find({ location: { $regex: location, $options: 'i' } });

    res.json({ proposals });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


// Add Bid to proposal (Worker Will Add Bid)  


exports.AddBid = async (req, res) => {
  const { proposalId, worker_id, price, coverletter } = req.body;

  try {
    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const newBid = { worker_id, price, coverletter };
    proposal.bids.push(newBid);
    await proposal.save();

    res.json(proposal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Workers Available (User)

exports.WorkersAvailable = async (req, res) => {
  try {
    const { type } = req.query;
    const workers = await User.find({ type: { $regex: type ? type.toLowerCase() : 'worker', $options: 'i' } });
    res.status(200).json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



