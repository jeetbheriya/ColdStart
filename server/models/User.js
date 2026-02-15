const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true
    },
    password: { 
        type: String, 
        required: true 
    },
    // ADDED: Role field to differentiate between individuals and organizations
    role: {
        type: String,
        enum: ["user", "company"],
        default: "user"
    },
    headline: { 
        type: String, 
        default: "New Member at ColdStart" 
    },
    skills: {
        type: [String], 
        default: []
    },
    about: {
        type: String,
        default: ""
    },
    profilePicture:  {
        type: String,
        default: ""
    },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);