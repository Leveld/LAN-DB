const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  age: Number,
  gender: String,
  contact: {
    contactEmail: String,
    phoneNumber: String,
    facebook: String,
    twitter: String,
    linkedIn: String,
    googlePlus: String
  },
  settings: {
    showEmail: Boolean,
    showContactEmail: Boolean,
    showAge: Boolean,
    showGender: Boolean,
    showPhoneNumber: Boolean,
    showFacebook: Boolean,
    showTwitter: Boolean,
    showLinkedIn: Boolean,
    showGooglePlus: Boolean
  }
});

module.exports = mongoose.model('User', UserSchema);