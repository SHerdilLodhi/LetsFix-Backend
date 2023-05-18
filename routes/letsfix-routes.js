const express= require("express")
const router = express.Router()
const User = require("../model/User")
const {UserSignup,UserLogin,UploadPorposal,ProposalsOnBoard,GetWork, AddBid, WorkersAvailable, ProposalDetail, AcceptBid, RequestWork, GivenBids, EditWorkerProfile, EditProfile, forgotPassword, resetPassword, GetBidByWorkerId, updateUserLocation} = require("../controllers/User-controller")



router.route("/signup").post(UserSignup)
router.route("/login").post(UserLogin)
router.route("/uploadproposal").post(UploadPorposal)
router.route("/proposalsonboard").post(ProposalsOnBoard)
router.route("/proposaldetail/:id").post(ProposalDetail)
router.route("/getwork").post(GetWork)
router.route("/addbid").put(AddBid)
router.route("/workersavailable").post(WorkersAvailable)
router.route("/acceptbid").post(AcceptBid)
router.route("/requestwork").post(RequestWork)
router.route("/givenbids").post(GivenBids)
router.route("/editprofile").put(EditProfile)
router.route("/forgotpassword").put(forgotPassword)
router.route("/resetpassword/:uuid").put(resetPassword)
router.route("/fetchbid").post(GetBidByWorkerId)
router.route("/updatelocation").post(updateUserLocation)



module.exports = router;

//643a91bf0d062db5957919d9 pid
//614a0e17f79f00457d1b2bb2