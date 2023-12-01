const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const auth = require("../../middleware/auth");

const prisma = new PrismaClient();

// @route   GET api/auth
// @desc    Get user by token
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    // Return user
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
  "/",
  [
    check("email", "Please include a valid email address").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 400 = bad request
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure the request body
    const { email, password } = req.body;

    try {
      // See if user exists
      let user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        // 400 = bad request
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      // Check if password matches
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        // 400 = bad request
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 36000 }, // TODO: Set to 3600 (1 hour) in production
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (e) {
      console.error(e.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
