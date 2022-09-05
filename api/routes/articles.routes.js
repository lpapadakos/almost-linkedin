const express = require('express');
const router = express.Router();

const upload = require('../middlewares/multerStorage');
const interaction = require('../middlewares/interaction');

const article = require('../controllers/articles.controller');

// Articles
router
  .route('/')
  .post(upload.array('media', 10), article.post)
  .get(article.get);

router.route('/:articleId').get(article.get).delete(article.delete);

// Likes (Interest Notes)
router
  .route('/:articleId/like')
  .post(article.like, interaction)
  .delete(article.unlike);

// Comments
router.post('/:articleId/comment', article.comment, interaction);
router.delete('/:articleId/comment/:commentId', article.deleteComment);

module.exports = router;
