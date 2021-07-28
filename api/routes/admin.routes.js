const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");

const controller = require("../controllers/admin.controller");

router.get("/list", verifyToken, controller.getAllUsers);
router.get("/export", verifyToken, controller.exportUsers);

module.exports = router;
