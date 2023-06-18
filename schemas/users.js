const Joi = require("joi");

const {emailRegexp} = require("../constants/users");

const userRegisterSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().required(),
})

const userLoginSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().required(),
})

module.exports = {
    userRegisterSchema,
    userLoginSchema,
}