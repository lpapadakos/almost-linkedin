const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const compression = require('compression');

const upload = require('../middlewares/multerStorage');
const parseUserData = (req, res, next) => {
  req.body = JSON.parse(req.body.user); // for "body" middleware to work
  next();
};
const validationHandler = require('../middlewares/validationHandler');
const adminOnly = require('../middlewares/adminOnly');
const sameUserOnly = (req, res, next) => {
  if (req.params.userId !== req.userId) {
    return res
      .status(403)
      .json({ error: 'Λειτουργία διαθέσιμη μόνο για τον ίδιοκτήτη του πόρου' });
  }

  next();
};

const user = require('../controllers/users.controller');

router.post(
  '/register',
  upload.single('image'),
  parseUserData,
  [
    body('name', 'Παρακαλώ εισάγετε το ονοματεπώνυμό σας').exists(),
    body('email', 'Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email').isEmail(),
    body('phone', 'Παρακαλώ εισάγετε έναν έγκυρο αριθμό τηλεφώνου')
      .isMobilePhone()
      .optional({ nullable: true, checkFalsy: true }),
    body(
      'password',
      'Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 8 χαρακτήρες'
    )
      .trim()
      .isLength({ min: 8 }),
  ],
  validationHandler,
  user.register
);

router.post(
  '/login',
  [body('email', 'Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email').isEmail()],
  validationHandler,
  user.login
);

// Profiles
router.get('/:userId?', user.get);
router.patch(
  '/:userId',
  sameUserOnly,
  upload.single('image'),
  parseUserData,
  [
    body('name', 'Παρακαλώ εισάγετε το ονοματεπώνυμό σας').exists(),
    body('email', 'Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email').isEmail(),
    body('phone', 'Παρακαλώ εισάγετε έναν έγκυρο αριθμό τηλεφώνου')
      .isMobilePhone()
      .optional({ nullable: true, checkFalsy: true }),
    body(
      'new_password',
      'Ο νέος κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 8 χαρακτήρες'
    )
      .trim()
      .isLength({ min: 8 })
      .optional({ nullable: true, checkFalsy: true }),
  ],
  validationHandler,
  user.update
);

// Contacts
router
  .route('/:userId/contact-requests')
  .post(user.addContactRequest)
  .get(sameUserOnly, user.getContactRequests);
router
  .route('/:userId/contact-requests/:requestId')
  .all(sameUserOnly)
  .patch(user.acceptContactRequest)
  .delete(user.deleteContactRequest);

router.get('/:userId/contacts', user.getContacts);

// Profile Entries
router.use('/:userId/:entryType', sameUserOnly, (req, res, next) => {
  if (!['experience', 'education', 'skills'].includes(req.params.entryType)) {
    return res
      .status(400)
      .json({ error: 'Δεν ορίζεται αυτός ο τύπος δεδομένων προφίλ' });
  }

  next();
});
router
  .route('/:userId/:entryType')
  .post(user.addEntry)
  .patch(user.changeEntryStatus);
router.delete('/:userId/:entryType/:entryId', user.deleteEntry);

// Admin stuff
// GET requests don't normally have a body, so use post, for list of ids in body
router.post('/export', adminOnly, compression(), user.export);

module.exports = router;
