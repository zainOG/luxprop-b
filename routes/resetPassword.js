const {
  resetPasswordRequestController,
  resetPasswordController,
  sendLoanMailController,
  confirmEmailController
} = require("../controllers/auth.controller");

const router = require("express").Router();

router.post("/auth/requestResetPassword", resetPasswordRequestController);
router.post("/auth/resetPassword", resetPasswordController);
router.post("/auth/newOrder", sendLoanMailController);
router.post("/auth/confirmEmail", confirmEmailController);

module.exports = router;
