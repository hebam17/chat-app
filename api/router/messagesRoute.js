const express = require("express");
const router = express.Router();

const { Auth } = require("../middleware/userAuth");
const messagesController = require("../controllers/messagesController");

// getting all messages between the current user and the named contact

router.route("/:contactId").get(Auth, messagesController.getMessages);

module.exports = router;
