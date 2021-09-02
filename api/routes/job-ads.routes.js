const express = require("express");
const router = express.Router();

const interaction = require("../middlewares/interaction");

const jobAd = require("../controllers/job-ads.controller");

// Job Ads
router.route("/").post(jobAd.post).get(jobAd.get);

router.route("/:jobAdId").get(jobAd.get).delete(jobAd.delete);

// User Applications
router.route("/:jobAdId/apply").post(jobAd.apply, interaction).delete(jobAd.cancelApply);

module.exports = router;
