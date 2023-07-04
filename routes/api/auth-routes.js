const express = require("express");
const router = express.Router();

const schemas = require('../../schemas/users');

const authController = require('../../controllers/auth-controller');

const {validateBody} = require('../../decorators/validateBody');
const upload = require("../../middlewares/upload");

const authenticate = require('../../middlewares/authenticate');

router.post("/register", validateBody(schemas.userRegisterSchema), authController.register);

router.get("/verify/:verificationToken", authController.verify);

router.post("/verify", validateBody(schemas.userEmailSchema), authController.resendVerify);

router.post("/login", validateBody(schemas.userLoginSchema), authController.login);

router.get("/current", authenticate, authController.getCurrent);

router.patch("/avatars", authenticate, upload.single("avatar"), authController.updateAvatar);


router.post("/logout", authenticate, authController.logout);

module.exports = router;