const express = require("express");
const authService = require("../services/authService");
const {
  getSettings,
  getSettingsById,
  createSettings,
  updateSettings,
  deleteSettings,
} = require("../services/SettingsService");
const {
  createSettingsValidator,
  getSettingsValidator,
  updateSettingsValidator,
  deleteSettingsValidator,
} = require("../utils/validators/settingsValidator");

const router = express.Router();

router.use(authService.protect);

router
  .route("/")
  .get(getSettings)
  .post(createSettingsValidator, createSettings);

router
  .route("/:id")
  .get(getSettingsValidator, getSettingsById)
  .put(updateSettingsValidator, updateSettings)
  .delete(deleteSettingsValidator, deleteSettings);

module.exports = router;
