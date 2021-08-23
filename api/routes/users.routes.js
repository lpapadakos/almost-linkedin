const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const upload = require("../middlewares/multerStorage");
const validationHandler = require("../middlewares/validationHandler");
const adminOnly = require("../middlewares/adminOnly");
const sameUserOnly = (req, res, next) => {
	if (req.params.userId !== req.userId) {
		return res.status(403).json({ error: "Διαθέσιμο μόνο για τον ίδιο χρήστη" });
	}

	next();
};

const usersController = require("../controllers/users.controller");

router.post(
	"/register",
	upload.single("image"),
	(req, res, next) => {
		req.body = JSON.parse(req.body.user); // for validation middleware to work
		next();
	},
	[
		body("name", "Παρακαλώ εισάγετε το ονοματεπώνυμό σας").exists(),
		body("email", "Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email").isEmail(),
		body("phone", "Παρακαλώ εισάγετε έναν έγκυρο αριθμό τηλεφώνου").isMobilePhone().optional({ nullable: true, checkFalsy: true }),
		body("password", "Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 8 χαρακτήρες").isLength({ min: 8 }),
	],
	validationHandler,
	usersController.register
);

router.post("/login", [body("email", "Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email").isEmail()], validationHandler, usersController.login);

// Profiles
router.get("/:userId?", usersController.get);
// TODO router.put("/:userId", sameUserOnly, usersController.update);

// Contacts
router.route("/:userId/contact-requests")
	.post(usersController.addContactRequest)
	.get(sameUserOnly, usersController.getContactRequests)
router.route("/:userId/contact-requests/:requestId")
	.all(sameUserOnly)
	.put(usersController.acceptContactRequest)
	.delete(usersController.deleteContactRequest);

router.get("/:userId/contacts", usersController.getContacts);

// Profile Entries
router.use("/:userId/:entryType", sameUserOnly, (req, res, next) => {
	if (!["experience", "education", "skills"].includes(req.params.entryType)) {
		return res.status(400).json({ error: "Δεν ορίζεται αυτός ο τύπος δεδομένων προφίλ" });
	}

	next();
});

router.route("/:userId/:entryType")
	.post(usersController.addEntry)
	.put(usersController.changeEntryStatus);

router.delete("/:userId/:entryType/:entryId", usersController.deleteEntry);

// Admin stuff
// TODO router.delete("/:userId", adminOnly, usersController.deactivate);
router.get("/export", adminOnly, usersController.export);

module.exports = router;
