const User = require("../models/User");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.headline = req.body.headline || user.headline;
      user.about = req.body.about || user.about;
      user.skills = req.body.skills || user.skills;
      user.profilePicture = req.body.profilePicture || user.profilePicture;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        headline: updatedUser.headline,
        about: updatedUser.about,
        skills: updatedUser.skills,
        profilePicture: updatedUser.profilePicture,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// @desc    Search for users by name, headline, or skills
// @route   GET /api/users/search/:query
const searchUsers = async (req, res) => {
  try {
    const { query } = req.params;
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { headline: { $regex: query, $options: "i" } },
        { skills: { $in: [new RegExp(query, "i")] } },
      ],
    }).select("-password"); // Exclude sensitive data

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
};

module.exports = { getUserProfile, updateUserProfile, searchUsers };
