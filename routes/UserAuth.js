const express = require("express");
const router = express.Router();
const { body, validationResult, check } = require("express-validator");
const User = require("../models/UserSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config.json");
const nodemailer = require("nodemailer");
const getuser = require("../middleware/getuser");

const JWT_SECRET = config.auth.JWT_SECRET;

router.post(
  "/signup",
  [
    body("email", "Enter a valid email").isEmail(),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 chars long")
      .matches(/\d/)
      .withMessage("Password must contain a number"),
    body("name", "Name should be more than 3 characters").isLength({ min: 3 }),
    body("bdate", "Birth date required.").isLength({ min: 6 }),
    body("cpassword", "Please confirm password.").isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let pass = req.body.password;
    let cpass = req.body.cpassword;

    if (pass !== cpass) {
      return res.status(401).json({ error: "Password dosen't match" });
    }

    const salt = await bcrypt.genSalt(10);
    let encryptedPassword = await bcrypt.hash(req.body.password, salt);

    try {
      const email = await User.findOne({ email: req.body.email.toLowerCase() });
      if (email) {
        return res.status(400).json({ error: "Email already exist." });
      }
      let useremail = req.body.email.toLowerCase();

      const user = await User.create({
        name: req.body.name,
        email: useremail,
        password: encryptedPassword,
        bdate: req.body.bdate,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);
      const mail = await sendMail(user);
      // console.log(mail);
      return res
        .status(200)
        .json({ message: "Account created ", authtoken: authtoken, otp: mail });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
);

const sendMail = (user) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "pratikgaikwad1004@gmail.com",
        pass: "zngnymzkgbjarexp",
      },
    });

    const otp = Math.floor(Math.random() * 9000 + 1000);

    var mailOptions = {
      from: "pratikgaikwad1004@gmail.com",
      to: user.email,
      subject: "MovizRate Account Verify",
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return error;
      } else {
        return otp;
      }
    });
    return otp;
  } catch (error) {
    return error;
  }
};

router.post(
  "/login",
  [
    body("email", "Enter valid email.").isEmail(),
    body("password", "Password cannot be blank.").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let email = req.body.email;
      let pass = req.body.password;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials." });
      }
      // Comparing password using bcryptjs.
      const passwordCompare = await bcrypt.compare(pass, user.password);

      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials." });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);

      if (!user.verified) {
        const mail = await sendMail(user);
        return res
          .status(200)
          .json({ authtoken: authtoken, otp: mail, user: user });
      }

      let usersend = await User.findById(data.user.id).select("-password");

      return res.status(200).json({ authtoken: authtoken, user: usersend });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
);

router.post("/verifyuser", getuser, async (req, res) => {
  try {
    // getting user id
    user_id = req.user.id;

    // Finding user by id without password
    let user = await User.findById(user_id).select("-password");
    // console.log(user);
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }
    user instanceof User;
    user.verified = true;
    await user.save();
    res.send({ msg: "Account Verified" });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

router.post("/getuser", getuser, async (req, res) => {
  try {
    // getting user id
    user_id = req.user.id;

    // Finding user by id without password
    let user = await User.findById(user_id).select("-password");
    if (!user) {
      res.status(404).json({ msg: "User Not Found" });
    }
    return res.status(200).json({ user: user });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

router.post("/changepassword", getuser, async (req, res) => {
  try {
    const user_id = req.user.id;

    let user = await User.findById(user_id);

    if (!user) {
      res.status(404).json({ msg: "User Not Found" });
    }

    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const verifyPassword = await bcrypt.compare(oldPassword, user.password);

    if (!verifyPassword) {
      return res.status(403).json({ msg: "Wrong Password" });
    }

    const salt = await bcrypt.genSalt(10);
    let encryptedPassword = await bcrypt.hash(newPassword, salt);

    user instanceof User;
    user.password = encryptedPassword;
    await user.save();

    res.status(200).json({ msg: "Password Changed" });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

router.post("/forgetpassword", async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({ msg: "Please enter email " });
    }
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ msg: "Enter valid email address" });
    }

    const mail = await sendMail(user);

    res.json({ otp: mail })

  } catch (error) {
    console.log(error);
  }
});

router.post("/changeforgottenpassword", async (req, res) => {
  try {

    if (!req.body.email) {
      return res.status(404).json({ msg: "Enter valid email address" });
    }

    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ msg: "Enter valid email address" });
    }

    const newPassword = req.body.newPassword;

    if (!newPassword) {
      return res.status(404).json({ msg: "Enter Password" });
    }

    const salt = await bcrypt.genSalt(10);
    let encryptedPassword = await bcrypt.hash(newPassword, salt);

    user instanceof User;
    user.password = encryptedPassword;
    await user.save();

    res.json({ msg: "Password updated" });
  } catch (error) {
    console.log(error)
  }
})

module.exports = router;
