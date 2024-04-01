const express = require("express");
const router = express.Router();

const convControllers = require("../controllers/convControllers");
const { Auth } = require("../middleware/userAuth");

router.route("/getConvs").get(Auth, convControllers.getConvs);
router.route("/deleteConv/:convId").get(Auth, convControllers.deleteConv);
router.route("/addConv").post(Auth, convControllers.addConv);

module.exports = router;
