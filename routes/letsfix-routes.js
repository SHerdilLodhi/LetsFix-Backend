const express= require("express")
const router = express.Router()
const User = require("../model/User")
const {UserSignup,UserLogin,UploadPorposal,ProposalsOnBoard,GetWork, AddBid, WorkersAvailable} = require("../controllers/User-controller")



router.route("/signup").post(UserSignup)
router.route("/login").post(UserLogin)
router.route("/uploadproposal").post(UploadPorposal)
router.route("/proposalsonboard").post(ProposalsOnBoard)
router.route("/getwork").post(GetWork)
router.route("/addbid").put(AddBid)
router.route("/workersavailable").get(WorkersAvailable)

module.exports = router;
