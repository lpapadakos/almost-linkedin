const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/multerStorage");

const articlesController = require("../controllers/articles.controller");

// Articles
router.post("/", verifyToken, upload.array("media", 10), articlesController.post);

router.get("/", verifyToken, articlesController.get);
router.get("/:articleId", verifyToken, articlesController.get);

router.delete("/:articleId", verifyToken, articlesController.delete);

// Likes (Interest Notes)
router.post("/:articleId/like", verifyToken, articlesController.like);
router.delete("/:articleId/like", verifyToken, articlesController.unlike);

// Comments
router.post("/:articleId/comment", verifyToken, articlesController.comment);
router.delete("/:articleId/comment/:commentId", verifyToken, articlesController.deleteComment);

module.exports = router;
