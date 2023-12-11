const getAttributes = (obj, attributeArray) => {
  const extractedAttributes = {};
  attributeArray.forEach(attribute => {
    if (obj.hasOwnProperty(attribute)) {
      extractedAttributes[attribute] = obj[attribute];
    }
  });
  return extractedAttributes;
}

const getFormattedDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  return formattedDate;
};

module.exports = {
  getAttributes,
  getFormattedDate
}