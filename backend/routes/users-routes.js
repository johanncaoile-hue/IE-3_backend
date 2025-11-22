const express = require("express");
const fileUpload = require("../middleware/file-upload");
const usersController = require("../controllers/users-controllers");

const router = express.Router();

router.post("/signup", fileUpload.single("image"), usersController.signup);
router.post("/login", usersController.login);

module.exports = router;
