const express= require("express")
const router = express.Router()
const User = require("../model/User")
const {UserSignup,UserLogin,UploadPorposal,ProposalsOnBoard} = require("../controllers/User-controller")



router.route("/signup").post(UserSignup)
router.route("/login").post(UserLogin)
router.route("/uploadproposal").post(UploadPorposal)
router.route("/proposalsonboard").post(ProposalsOnBoard)
module.exports = router;
