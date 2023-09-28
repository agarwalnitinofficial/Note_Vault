const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const fetchuser=require('../middleware/fetchuser')
const { body, validationResult } = require("express-validator");
const JWT_SECRET = "nitinisagood";

//Create a User using: POST "/api/auth/createuser" -->No login require
router.post(
  "/createuser",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Name must have at least 3 letter").isLength({ min: 3 }),
    body("password", "Password must have at least 5 letter").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success=false;
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    //check if user with same email exist already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({success, error: "user with same name exist" });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      //authentication token
      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success, authToken });
    } catch (err) {
      console.log(err);
      res.status(500).send("Some error occured");
    }
  }
);

//Authenticate a User using: POST "/api/auth/login" -->No login require
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must have at least 5 letter").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success=false
        return res
          .status(400)
          .json({ success,error: "Please try to login with correct credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success=false;
        return res
          .status(400)
          .json({ success,error: "Please try to login with correct credentials" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      success=true;
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({success, authToken });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error");
    }
  }
);


//Get loggedin  User details: POST "/api/auth/getuser" -->login require
router.post(
    "/getuser",
    fetchuser,
    async (req, res) => {
      try {
        const userId=req.user.id;
        const user=await User.findById(userId).select("-password")
        res.json({user})
        
      } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
      }
    }
);



module.exports = router;