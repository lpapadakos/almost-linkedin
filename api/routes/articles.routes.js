const express = require("express");
const router = express.Router();

const upload = require("../middlewares/multerStorage");

const articlesController = require("../controllers/articles.controller");

// Articles
router.route("/")
	.post(upload.array("media", 10), articlesController.post)
	.get(articlesController.get);

router.route("/:articleId")
	.get(articlesController.get)
	.delete(articlesController.delete);

// Likes (Interest Notes)
router.route("/:articleId/like")
	.post(articlesController.like)
	.delete(articlesController.unlike);

// Comments
router.route("/:articleId/comment")
	.post(articlesController.comment)
	.delete(articlesController.deleteComment);

module.exports = router;
