const mongoose = require('mongoose');
const UserBase = require('./UserBase');

/* ManagerBase
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
const ManagerBase = (extend) => {
  const schema = UserBase({
    managers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager'
    }]
  });

  if (typeof extend === 'object' && extend !== null)
    schema.add(extend);

  return schema;
};

module.exports = ManagerBase;
