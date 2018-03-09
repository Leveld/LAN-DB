const { mapAsync } = require('capstone-utils');

const transform = async (doc, converted, options) => {
  const searchObject = async (obj) => {
    if (obj instanceof Promise)
      obj = await obj;
    if (typeof obj !== 'object' || obj === null)
      return obj;
    if (obj.constructor.name === 'ObjectID')
      return obj;
    if (obj instanceof Date)
      return obj;
    if (obj instanceof Buffer)
      return obj;
    if (Array.isArray(obj))
      return await mapAsync(obj, async (item) => await searchObject(item));
    for (let [key, value] of Object.entries(obj))
      obj[key] = await searchObject(value);
    return obj;
  };

  try {
    converted = await searchObject(converted);
  } catch (error) {  }

  return converted;
};

module.exports = transform;
