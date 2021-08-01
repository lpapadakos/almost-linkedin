const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");

const controller = require("../controllers/article.controller");

router.get("/:id", verifyToken, controller.getArticleById);
router.get("/?from=:userId", verifyToken, controller.getUserArticles);
router.get("/", verifyToken, controller.getArticles);

//TODO psot article router.post("/", verifyToken, controller.postArticle);

module.exports = router;
