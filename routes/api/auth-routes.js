const express = require("express");
const router = express.Router();

const schemas = require('../../schemas/users');

const authController = require('../../controllers/auth-controller');

const {validateBody} = require('../../decorators/validateBody');

const authenticate = require('../../middlewares/authenticate');

router.post("/register", validateBody(schemas.userRegisterSchema), authController.register);

router.post("/login", validateBody(schemas.userLoginSchema), authController.login);

router.get("/current", authenticate, authController.getCurrent);

router.post("/logout", authenticate, authController.logout);

module.exports = router;