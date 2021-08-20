const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const upload = require("../middlewares/multerStorage");
const validationHandler = require("../middlewares/validationHandler");
const verifyToken = require("../middlewares/verifyToken");
const adminOnly = require("../middlewares/adminOnly");

const sameUserOnly = async (req, res, next) => {
	if (req.params.userId !== req.userId) return res.status(403).json({ error: "Διαθέσιμο μόνο για τον ίδιο χρήστη" });

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
router.get("/", verifyToken, usersController.get);
router.get("/:userId", verifyToken, usersController.get);

router.post("/:userId/experience", verifyToken, sameUserOnly, userController.addExperience);
router.put("/:userId/experience", verifyToken, sameUserOnly, userController.changeExperienceStatus);
router.delete("/:userId/experience", verifyToken, sameUserOnly, userController.deleteExperience);

router.post("/:userId/education", verifyToken, sameUserOnly, userController.addEducation);
router.put("/:userId/education", verifyToken, sameUserOnly, userController.changeEducationStatus);
router.delete("/:userId/education", verifyToken, sameUserOnly, userController.deleteEducation);

router.post("/:userId/skills", verifyToken, sameUserOnly, userController.addSkills);
router.put("/:userId/skills", verifyToken, sameUserOnly, userController.changeSkillsStatus);
router.delete("/:userId/skills", verifyToken, sameUserOnly, userController.deleteSkills);

// Contacts
router.post("/:userId/contact-requests", verifyToken, usersController.addContactRequest);
router.get("/:userId/contact-requests", verifyToken, sameUserOnly, usersController.getContactRequests);
router.put("/:userId/contact-requests/:requestId", verifyToken, sameUserOnly, usersController.acceptContactRequest);
router.delete("/:userId/contact-requests/:requestId", verifyToken, sameUserOnly, usersController.deleteContactRequest);

router.get("/:userId/contacts", verifyToken, usersController.getContacts);

// Admin stuff
// TODO router.delete("/:userId", verifyToken, adminOnly usersController.deactivate);
router.get("/export", verifyToken, adminOnly, usersController.export);

module.exports = router;
