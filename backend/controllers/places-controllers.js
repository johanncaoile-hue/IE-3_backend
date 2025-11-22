const fs = require("fs");
const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");

exports.getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch {
    return next(new HttpError("Could not find place.", 500));
  }

  if (!place) {
    return next(new HttpError("Place not found.", 404));
  }

  res.json({ place: place.toObject({ getters: true }) });
};

exports.getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch {
    return next(new HttpError("Fetching places failed.", 500));
  }

  res.json({ places: places.map(p => p.toObject({ getters: true })) });
};

exports.createPlace = async (req, res, next) => {
  const { title, description, address, creator } = req.body;

  const createdPlace = new Place({
    title,
    description,
    address,
    image: req.file.path,
    creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch {
    return next(new HttpError("Creating place failed.", 500));
  }

  if (!user) {
    return next(new HttpError("User not found.", 404));
  }

  try {
    await createdPlace.save();
    user.places.push(createdPlace);
    await user.save();
  } catch {
    return next(new HttpError("Creating place failed.", 500));
  }

  res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};

exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch {
    return next(new HttpError("Could not delete place.", 500));
  }

  if (!place) return next(new HttpError("Place not found.", 404));

  const imagePath = place.image;

  try {
    await place.remove();
    place.creator.places.pull(place);
    await place.creator.save();
  } catch {
    return next(new HttpError("Deleting place failed.", 500));
  }

  fs.unlink(imagePath, err => console.log("Deleted file:", err));

  res.status(200).json({ message: "Deleted place." });
};
