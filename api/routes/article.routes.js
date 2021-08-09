const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const upload = require('../middlewares/multerStorage');

const controller = require("../controllers/article.controller");

router.post("/", verifyToken, upload.array("media", 10), controller.postArticle);

router.get("/:id", verifyToken, controller.getArticleById);
router.get("/?from=:userId", verifyToken, controller.getUserArticles);
router.get("/", verifyToken, controller.getArticles);

module.exports = router;
