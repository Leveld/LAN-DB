const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/* UserBase
 * Parameters:
 *   extend: <Object>
 *     A key-value Objects of fields to add to this schema.
 *     Example:
 *       {
 *         address: String,
 *         phoneNumber: String
 *       }
 * Returns:
 *   A Schema Object with passed in fields added to it. If 'extends'
 *   is not a key-value Object, it will be ignored and the base Schema
 *   will be returned.
 */
const UserBase = (extend) => {
  const schema = new Schema({
    email: {
      type: String,
      required: true,
      unique: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      required: true
    },
    auth0ID: {
      type: String,
      required: true
    },
    lastIP: String,
    lastLoginAt: Date,
    createdAt: {
      type: Date,
      required: true
    },
    age: Number,
    gender: String,
    contact: {
      email: String,
      phoneNumber: String,
      facebook: String,
      twitter: String,
      linkedIn: String,
      googlePlus: String
    },
    settings: {
      showEmail: {
        type: Boolean,
        default: false
      },
      showContactEmail: {
        type: Boolean,
        default: false
      },
      showAge: {
        type: Boolean,
        default: false
      },
      showGender: {
        type: Boolean,
        default: false
      },
      showPhoneNumber: {
        type: Boolean,
        default: false
      },
      showFacebook: {
        type: Boolean,
        default: false
      },
      showTwitter: {
        type: Boolean,
        default: false
      },
      showLinkedIn: {
        type: Boolean,
        default: false
      },
      showGooglePlus: {
        type: Boolean,
        default: false
      }
    }
  });

  if (typeof extend === 'object' && extend !== null)
    schema.add(extend)

  return schema;
}

module.exports = UserBase;
