const express = require("express");
const router = express.Router();

const schemas = require('../../schemas/users');

const authController = require('../../controllers/auth-controller');

const {validateBody} = require('../../decorators/validateBody');

router.post("/signup", validateBody(schemas.userRegisterSchema), authController.signup);

router.post("/signin", validateBody(schemas.userLoginSchema), authController.signin);

module.exports = router;