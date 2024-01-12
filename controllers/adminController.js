const User = require("./../Models/userModal");

exports.createAdmin = async (req, res) => {
  try {
    const role = "Admin";
    const newAdmin = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: role,
    });
    res.status(201).json({
      status: "success",
      data: {
        user: newAdmin,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const users = await User.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};
exports.getAllAdmins = async (req, res, next) => {
  try {
    const users = await User.find();
    const adminUsers = users.filter((user) => user.role === "Admin");
    res.status(200).json({
      status: "success",
      results: adminUsers.length,
      data: {
        users: adminUsers,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const userEmail = req.body.originalEmail;
    const userCheck = await User.findOne({ email: userEmail });
    if (!userCheck) {
      return res.status(404).json({
        status: "fail",
        msg: "User not found",
      });
    }
    const user = await User.findOneAndUpdate({ email: userEmail }, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        user: user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const userCheck = await User.findById(userId);
    if (!userCheck) {
      return res.status(404).json({
        status: "fail",
        msg: "User not found",
      });
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        users: user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};
exports.deleteAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Admin not found",
      });
    }
    await User.deleteOne({ _id: user._id });
    res.status(200).json({
      status: "success",
      message: "Admin successfully deleted",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
