const express = require('express');
const router = express.Router()
const auth = require("../../middleware/auth")
const { check, validationResult } = require('express-validator')
const Profile = require("../../models/Profile")
const User = require("../../models/User")

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    // On va récupérer le profile qui correspond à l'id du user connecté. On populate (rajoute) les infos name et avatar venant du model "user". On peut populate parce que dans le model de Profile, on a inclus un lien vers le model de user (voire le model de Profile ligne 4)
    const profile = await Profile.findOne({ user: req.user.id }).populate("user", [ "name", "avatar" ])

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" })
    }

    res.json(profile)

  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})


// @route   POST api/profile
// @desc    Create or Update user profile
// @access  Private
router.post("/", [ auth, [
  check("status", "Status is required")
    .not()
    .isEmpty(),
  check("skills", "Skills is required")
    .not()
    .isEmpty() ] ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    };

    // destructure the request
    const {
      company,
      location,
      bio,
      status,
      website,
      githubusername,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      // spread the rest of the fields we don't need to check
      ...rest
    } = req.body;

    // Build profile object
    const profileFields = {}
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    // Build social object
    // Need to create empty one first or we will have an error saying "can't find profileFields.social" something like this
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile)
      }

      if (!profile) {
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
      }
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server Error")
    }
  })


// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", [ "name", "avatar" ]);
    res.json(profiles)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})


// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate("user", [ "name", "avatar" ]);

    if (!profile) return res.status(400).json({ msg: "Profile not found" })

    res.json(profile)
  } catch (err) {
    console.error(err.message)
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" })
    }
    res.status(500).send("Server Error")
  }
})


// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete("/", auth, async (req, res) => {
  try {
    // Comme on passe d'abord par auth, on a accès à l'id grâce au token dans la requete car on les a rajouté dans le middleware auth
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "User deleted" })
  } catch (err) {
    console.error(err.message)
    res.status(400).json({ msg: "Profile not found" })
  }
})


// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put("/experience", [ auth, [
  check("title", "Title is required")
    .not()
    .isEmpty(),
  check("company", "Company is required")
    .not()
    .isEmpty(),
  check("from", "From date is required")
    .not()
    .isEmpty(),

] ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // On récupère les infos de la requêtes
  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body;

  // On crée un nouvel obj à partir des infos du dessus
  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }

  try {
    // Comme on passe d'abord par auth, on a accès à l'id grâce au token dans la requete car on les a rajouté dans le middleware auth
    const profile = await Profile.findOne({ user: req.user.id });

    profile.experience.unshift(newExp);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
})


// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    // Comme on passe d'abord par auth, on a accès à l'id grâce au token dans la requete car on les a rajouté dans le middleware auth
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(400).json({ msg: "Profile not found" })
  }
})

module.exports = router