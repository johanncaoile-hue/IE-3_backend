const express = require("express");
const fileUpload = require("../middleware/file-upload");
const placesController = require("../controllers/places-controllers");

const router = express.Router();

router.get("/:pid", placesController.getPlaceById);
router.get("/user/:uid", placesController.getPlacesByUserId);

router.post("/", fileUpload.single("image"), placesController.createPlace);

router.delete("/:pid", placesController.deletePlace);

module.exports = router;


