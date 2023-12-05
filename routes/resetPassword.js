const {
  resetPasswordRequestController,
  resetPasswordController,
  sendLoanMailController
} = require("../controllers/auth.controller");

const router = require("express").Router();

router.post("/auth/requestResetPassword", resetPasswordRequestController);
router.post("/auth/resetPassword", resetPasswordController);
router.post("/auth/newOrder", sendLoanMailController);

module.exports = router;
