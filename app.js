const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const listRouter = require("./routes/listRoutes");
const adminRouter = require("./routes/adminRoutes");
const chatRouter = require("./routes/chat");
const AppError = require("./utils/appError");
const app = express();
// 1) MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.static("Images"));
app.use(express.static("Lists"));
app.use(express.static("profile"));
app.use(express.json());

app.use(cors());
// 3) ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/lists", listRouter);
app.use("/api/v1/chatList", userRouter);
app.use("/api/v1/sendNotification", listRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/getChat", userRouter);
app.use("/api/v1/sendMessage", listRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
