const path = require("path");
const axios = require("axios");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const http = require("http");
const initializeSocket = require("./services/socketService");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/ApiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");

//routes
const PostRoute = require("./routes/PostRoute");
const CommentRoute = require("./routes/CommentRoute");
const ReactionRoute = require("./routes/ReactionRoute");
const FollowRoute = require("./routes/FollowRoute");
const ChildRoute = require("./routes/ChildRoute");
const UserRoute = require("./routes/UserRoute");
const authRoute = require("./routes/authRoute");
const messageRouter = require("./routes/MessageRoute");
const ChatRouter = require("./routes/chatRoute");
const donationRouter = require("./routes/DonationRoute");
const donationItemRouter = require("./routes/DonationItemRoute");
const adoptionRequestRouter = require("./routes/AdoptionRequestRoute");
const notificationRouter = require("./routes/NotificationRoute");
const settingsRouter = require("./routes/SettingsRoute");
// connect with db
dbConnection();

// express app
const app = express();

// Middlewares
app.use(express.json());
app.use("/upload", express.static(path.join(__dirname, "upload")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// mount Routes
app.use("/api/v1/posts", PostRoute);
app.use("/api/v1/Comments", CommentRoute);
app.use("/api/v1/Reactions", ReactionRoute);
app.use("/api/v1/Follow", FollowRoute);
app.use("/api/v1/Children", ChildRoute);
app.use("/api/v1/users", UserRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/chat", ChatRouter);
app.use("/api/v1/donations", donationRouter);
app.use("/api/v1/donation-items", donationItemRouter);
app.use("/api/v1/adoption-requests", adoptionRequestRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/settings", settingsRouter);

//Global  error Handling middleware for express
app.use(globalError);

const httpServer = http.createServer(app);
initializeSocket(httpServer);

const PORT = process.env.PORT || 8000;
const server = httpServer.listen(PORT, () => {
  console.log(`Server + Socket.IO running on PORT ${PORT}`);
});

// Events => list => callback(err) خارج ال express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
///////////////////////////////////////////////////////////////////
const Child = require("./models/ChildModel");

function isEmptyObject(obj) {
  return (
    obj &&
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    Object.keys(obj).length === 0
  );
}
app.post("/api/v1/ai_search", async (req, res, next) => {
  const { query } = req.body;
  console.log(query);

  try {
    const aiRes = await axios.post("http://localhost:5000/predict", {
      text: query,
    });
    const results = aiRes.data.prediction;
    if (isEmptyObject(results)) {
      res.status(200).json({
        success: true,
        count: 0,
        kids: [],
      });
    }

    const today = new Date();

    console.log("we search at", aiRes.data);

    // نحسب الـ fromDate و toDate من العمر فقط لو موجود
    let birthdateCondition;
    if (results.age) {
      const fromDate = new Date(
        today.getFullYear() - (results.age + 1),
        today.getMonth(),
        today.getDate()
      );
      const toDate = new Date(
        today.getFullYear() - results.age,
        today.getMonth(),
        today.getDate()
      );
      birthdateCondition = { birthdate: { $gte: fromDate, $lt: toDate } };
    }

    // بناء شروط البحث $or
    const orConditions = [];

    if (results.gender) orConditions.push({ gender: results.gender });
    if (results.hair_color)
      orConditions.push({ hairColor: results.hair_color });
    if (results.hair_style)
      orConditions.push({ hairStyle: results.hair_style });
    if (results.skin_tone) orConditions.push({ skinTone: results.skin_tone });
    if (results.eye_color) orConditions.push({ eyeColor: results.eye_color });
    if (results.personality)
      orConditions.push({ personality: results.personality });
    if (results.religion) orConditions.push({ religion: results.religion });
    if (birthdateCondition) orConditions.push(birthdateCondition);

    const children = await Child.find({ $or: orConditions })
      .populate("orphanage", "name image")
      .lean();

    const kids = children.map((child) => {
      const birthDate = new Date(child.birthdate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        // eslint-disable-next-line no-plusplus
        age--;
      }
      const image = child.image?.startsWith("/upload/children/")
        ? child.image
        : `/upload/children/${child.image}`;
      return {
        ...child,
        age,
        image,
      };
    });

    res.status(200).json({
      success: true,
      count: kids.length,
      kids,
    });
  } catch (err) {
    next(err);
  }
});

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});
