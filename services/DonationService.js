const factory = require("./handlerFactory");
const Donation = require("../models/DonationModel");

const { sendDonationNotification } = require("./NotificationService");

const generateReceiptNumber = () => `RCPT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

exports.updateDonation = factory.updateOne(Donation);
exports.deleteDonation = factory.deleteOne(Donation);

exports.createDonation = async (req, res) => {
  try {
    const receiptNumber = generateReceiptNumber();
    const {
      orphanageId,
      amount,
      paymentMethod,
      cardHolderName,
      cardNumber,
      cvc,
      expiryDate,
    } = req.body;

    const donation = await Donation.create({
      userId: req.user._id,
      orphanageId,
      amount,
      receiptNumber,
      paymentMethod,
      cardHolderName,
      cardNumber,
      cvc,
      expiryDate,
      status: "completed", // لو لسه مفيش بوابة دفع
    });
      
    await sendDonationNotification(req.user._id, orphanageId, donation._id);

    res.status(201).json({ success: true, data: donation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ orphanageId: req.user._id })
      .populate("userId", "name image")
      .populate("orphanageId", "name");
   const formatted = donations.map(d => ({
        id: d._id,
        donorName: d.userId.name,
        donorImage: d.userId.image,
        orphanageName: d.orphanageId.name,
        amount: d.amount,
        paymentMethod: d.paymentMethod,
        receiptNumber: d.receiptNumber,
        createdAt: d.createdAt,
        donationType: "money"
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("userId", "name image")
      .populate("orphanageId", "name image");

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }
    res.status(200).json({
      success: true,
      data: {
        id: donation._id,
        amount: donation.amount,
        paymentMethod: donation.paymentMethod,
        status: donation.status,
        receiptNumber: donation.receiptNumber,
        createdAt: donation.createdAt,
        donor: {
          name: donation.userId.name,
          image: donation.userId.image,
        },
        orphanage: {
          name: donation.orphanageId.name,
          image: donation.orphanageId.image,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

