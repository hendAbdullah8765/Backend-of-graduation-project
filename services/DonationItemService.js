const asyncHandler = require('express-async-handler')
const factory = require("./handlerFactory");
const DonationItem = require("../models/DonationItemModel");
const { sendDonationNotification } = require("./NotificationService"); // غيّري المسار حسب مكان الملف


// Helper to generate receipt number
const generateReceiptNumber = () => `ITEM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

// Create Donation Item
exports.createDonationItem = asyncHandler(async (req, res) => {
  const {
    orphanageId,
    itemType,
    clothingCondition,
    piecesCount,
    foodType,
    foodQuantity,
    isReadyForPickup,
    deliveryMethod,
    deliveryDate,
    deliveryTime,
    deliveryLocation,
  } = req.body;

  const receiptNumber = generateReceiptNumber();

  const donationItem = await DonationItem.create({
    userId: req.user._id,
    orphanageId,
    itemType,
    clothingCondition,
    piecesCount,
    foodType,
    foodQuantity,
    isReadyForPickup,
    deliveryMethod,
    deliveryDate,
    deliveryTime,
    deliveryLocation,
    receiptNumber,
  });
       const fullDonation = await DonationItem.findById(donationItem._id)
      .populate("orphanageId", "name address")
      .populate("userId", "name image");

      if (req.user._id.toString() !== orphanageId.toString()) {
  console.log("Sending donation Notification");
  await sendDonationNotification(req.user._id, orphanageId, donationItem._id, true); // isItem = true
}


  res.status(201).json({ success: true, data: fullDonation });
});

// Get all donation items
exports.getAllDonationItems = asyncHandler(async (req, res) => {
    const orphanageId = req.user.orphanage || req.user._id;
   console.log("orphanageId from token:", orphanageId);

  const donations = await DonationItem.find({ orphanageId: orphanageId})
    .populate("userId", "name image")
    .populate("orphanageId", "name image address");

  const formatted = donations.map((d) => ({
    id: d._id,
    receiptNumber: d.receiptNumber,
    donorName: d.userId?.name || "Anonymous",
    donorImage: d.userId?.image || "",
    orphanageName: d.orphanageId?.name || "",
    itemType: d.itemType,
    deliveryMethod: d.deliveryMethod,
    deliveryDate: d.deliveryDate,
    status: d.status,
    createdAt: d.createdAt,
  }));

  res.status(200).json({ success: true, data: formatted });
});

exports.getDonationItemById = async (req, res) => {
  try {
    const donation = await DonationItem.findById(req.params.id)
      .populate("userId", "name image")
      .populate("orphanageId", "name image");

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    const donationDetails = {
      receiptNumber: donation.receiptNumber,
      donor: {
        name: donation.userId?.name || "Anonymous",
        image: donation.userId?.image || null,
      },
      orphanage: {
        name: donation.orphanageId?.name || "",
        image: donation.orphanageId?.image || "",
      },
      itemType: donation.itemType,
      details:
        donation.itemType === "clothes"
          ? {
              clothingCondition: donation.clothingCondition,
              piecesCount: donation.piecesCount,
            }
          : {
              foodType: donation.foodType,
              foodQuantity: donation.foodQuantity,
            },
      deliveryMethod: donation.deliveryMethod,
      deliveryDate: donation.deliveryDate,
      deliveryTime: donation.deliveryTime,
      deliveryLocation: donation.deliveryLocation,
      status: donation.status,
      createdAt: donation.createdAt,
    };

    res.status(200).json({ success: true, data: donationDetails });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDonationItem = factory.updateOne(DonationItem);
exports.deleteDonationItem = factory.deleteOne(DonationItem);
