const express = require("express");
const router = express.Router();
const { body } = require('express-validator');

const validationHandler = require("../middlewares/validationHandler");
const verifyToken = require("../middlewares/verifyToken");

const controller = require("../controllers/user.controller");

router.post("/login", [
	body('email', "Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email").isEmail()
], validationHandler, controller.login);

router.post("/register", [
	body('name', "Παρακαλώ εισάγετε το ονοματεπώνυμό σας").exists(),
	body('email', "Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email").isEmail(),
	body('phone', "Παρακαλώ εισάγετε έναν έγκυρο αριθμό τηλεφώνου").isMobilePhone().optional({ nullable: true, checkFalsy: true }),
	body('password', "Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 8 χαρακτήρες").isLength({ min: 8 })
], validationHandler, controller.register);

router.get("/profile/:id", verifyToken, controller.getById);

module.exports = router;
