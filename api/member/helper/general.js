const getAttributes = (obj, attributeArray) => {
  const extractedAttributes = {};
  attributeArray.forEach((attribute) => {
    if (obj.hasOwnProperty(attribute)) {
      extractedAttributes[attribute] = obj[attribute];
    }
  });
  return extractedAttributes;
};

const getFormattedDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return formattedDate;
};

const getMonday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(now.getDate() - now.getDay() + (now.getDay() == 0? -6: 1)).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day} 00:00:00`;

  return formattedDate;
};

const getSunday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(now.getDate() - now.getDay() + (now.getDay() == 0? -6: 1) + 6).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day} 00:00:00`;

  return formattedDate;
}

const getFirstDayOfMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const formattedDate = `${year}-${month}-01 00:00:00`;

  return formattedDate;
}

const getLastDayOfMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const year = lastDay.getFullYear();
  const month = String(lastDay.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(lastDay.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day} 23:59:59`;

  return formattedDate;
}

module.exports = {
  getAttributes,
  getFormattedDate,
  getMonday,
  getSunday,
  getFirstDayOfMonth,
  getLastDayOfMonth,
};
