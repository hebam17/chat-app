const express = require("express");
const router = express.Router();

const convControllers = require("../controllers/convControllers");
const { Auth } = require("../middleware/userAuth");

router.use(Auth);

router.route("/getConvs").get(convControllers.getConvs);
router.route("/deleteConv/:convId").get(convControllers.deleteConv);
router.route("/addConv").post(convControllers.addConv);

module.exports = router;
