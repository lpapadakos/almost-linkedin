const express = require("express");
const router = express.Router();

const interaction = require("../middlewares/interaction");

const discussion = require("../controllers/discussions.controller");

router.get("/", discussion.summary);

router.route("/:userId").post(discussion.sendMessage, interaction).get(discussion.get);

module.exports = router;
