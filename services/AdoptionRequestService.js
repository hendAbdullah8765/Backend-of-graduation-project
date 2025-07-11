const factory = require("./handlerFactory");
const AdoptionRequest = require("../models/AdoptionRequestModel");
const { sendAdoptionNotification } = require("./NotificationService");
const Child = require("../models/ChildModel")
const User =require("../models/UserModel")

exports.getAdoptionRequests = async (req, res) => {
  try {

    const orphanageId = req.user.orphanage || req.user._id;
   console.log("orphanageId from token:", orphanageId);

    const requests = await AdoptionRequest.find({ orphanage: orphanageId }) 
      .sort({ createdAt: -1 })
      .populate("userId", "name image")
      .populate("childId", "name eyeColor image gender skinTone religion hairColor hairStyle personality birthdate createdAt timestamps");

    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdoptionRequestById = async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id)
      .populate("userId", "name image")
      .populate("childId", "name eyeColor image gender skinTone religion hairColor hairStyle personality birthdate createdAt timestamps");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAdoptionRequest = async (req, res) => {
  try {
    const {
      orphanage,
      childId,
      phone,
      maritalStatus,
      occupation,
      monthlyIncome,
      religion,
      location,
      reason,
    } = req.body;

    const newRequest = await AdoptionRequest.create({
      userId: req.user._id,
      orphanage,
      childId,
      phone,
      maritalStatus,
      occupation,
      monthlyIncome,
      religion,
      location,
      reason,
    });

    const child = await Child.findById(childId).select('orphanage');
    const orphanageId = child?.orphanage;
    if (!orphanageId) {
      return res.status(400).json({ success: false, message: 'Child has no orphanage assigned' });
    }

    const orphanageUser = await User.findOne({ orphanage: orphanageId });
    if (orphanageUser) {
      await sendAdoptionNotification(req.user._id, orphanageUser._id, newRequest._id);
    }

    res.status(201).json({ success: true, data: newRequest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.updateAdoptionRequest = async (req, res) => {
  try {
    const updatedRequest = await AdoptionRequest.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          reason: req.body.reason,
          phone: req.body.phone,
          location: req.body.location,
          monthlyIncome: req.body.monthlyIncome,
          martialStatus: req.body.martialStatus,
          occupation: req.body.occupation,
          status: req.body.status 
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Adoption request not found"
      });
    }

    res.status(200).json({
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteAdoptionRequest = factory.deleteOne(AdoptionRequest);
