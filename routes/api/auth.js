const express = require('express');
const router = express.Router()
const auth = require("../../middleware/auth")
const User = require("../../models/User")
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')


// @route   GET api/auth
// @desc    Get user by token
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
})



// @route   POST api/auth
// @desc    Authenticate user & Get token
// @access  Public
router.post("/", [
  check("email", "Email is required")
    .isEmail(),
  check("password", "Password is required ")
    .exists()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body

  try {
    let user = await User.findOne(({ email }));

    if (!user) {
      return res.status(400).json({ errors: [ { msg: "Invalid Credentials" } ] })
    };

    // On va comparer le password en clair de la requête (requête = form envoyé par le user) avec celui crypté dans l'objet user. Celui dans l'objet user est crypté car on l'a récupéré de la bdd, où il est crypté
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ errors: [ { msg: "Invalid Credentials" } ] })
    }

    const payload = {
      user: {
        id: user.id,
      }
    }

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    )

  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})




module.exports = router