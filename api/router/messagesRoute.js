const express = require("express");
const router = express.Router();

const { Auth } = require("../middleware/userAuth");
const messagesController = require("../controllers/messagesController");

router.use(Auth);
// getting all messages between the current user and the named contact

router.route("/:convId").get(Auth, messagesController.getMessages);
router.route("/:convId/:messageId").delete(messagesController.deleteMessage);
router.route("/setRead/:convId").put(messagesController.setRead);

module.exports = router;
