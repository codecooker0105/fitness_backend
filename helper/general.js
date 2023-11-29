const getAttributes = (obj, attributeArray) => {
  const extractedAttributes = {};
  attributeArray.forEach(attribute => {
    if (obj.hasOwnProperty(attribute)) {
      extractedAttributes[attribute] = obj[attribute];
    }
  });
  return extractedAttributes;
}

module.exports = {
  getAttributes
}