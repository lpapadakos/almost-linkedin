const express = require("express");
const router = express.Router();
const { body } = require('express-validator');

const upload = require('../middlewares/multerStorage');
const validationHandler = require("../middlewares/validationHandler");
const verifyToken = require("../middlewares/verifyToken");
const adminOnly = require("../middlewares/adminOnly");

const usersController = require("../controllers/users.controller");

router.post("/register", upload.single("image"), (req, res, next) => {
	req.body = JSON.parse(req.body.user); // for validation middleware to work
	next();
}, [
	body('name', "Παρακαλώ εισάγετε το ονοματεπώνυμό σας").exists(),
	body('email', "Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email").isEmail(),
	body('phone', "Παρακαλώ εισάγετε έναν έγκυρο αριθμό τηλεφώνου").isMobilePhone().optional({ nullable: true, checkFalsy: true }),
	body('password', "Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 8 χαρακτήρες").isLength({ min: 8 })
], validationHandler, usersController.register);

router.post("/login", [
	body('email', "Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email").isEmail()
], validationHandler, usersController.login);

// Profiles
// The same controller handler for getting single id
router.get("/", verifyToken, usersController.get);
//TODO router.put("/:userId", verifyToken, userController.update);

// Contacts
router.post("/:userId/contact-requests", verifyToken, usersController.addContactRequest);
router.get("/:userId/contact-requests", verifyToken, usersController.getContactRequests);
router.put("/:userId/contact-requests/:requestId", verifyToken, usersController.acceptContactRequest);
router.delete("/:userId/contact-requests/:requestId", verifyToken, usersController.rejectContactRequest);

router.get("/:userId/contacts", verifyToken, usersController.getContacts);

// Admin stuff
// TODO router.delete("/:userId", verifyToken, adminOnly usersController.deactivate);
router.get("/export", verifyToken, adminOnly, usersController.export);

module.exports = router;
