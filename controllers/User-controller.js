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

// Show uploaded proposals (Bids On Board)

exports.ProposalsOnBoard = async (req, res) => {
  try {
    const userId = req.body.user;
    const proposals = await Proposal.find({ user: userId });
    res.status(200).json(proposals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
