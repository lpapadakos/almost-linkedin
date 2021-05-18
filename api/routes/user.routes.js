const express = require("express");
const router = express.Router();
const { body } = require('express-validator');

const validationHandler = require("../middlewares/validationHandler");
const controller = require("../controllers/user.controller");

//TODO user friendly msg?
router.post("/register", [
	body('name').exists(),
	body('email').isEmail(),
	body('password').isLength({ min: 8 }),
	body('phone').isMobilePhone()
], validationHandler, controller.register);

router.post("/login", [
	body('email').isEmail()
], validationHandler, controller.login);

module.exports = router;
