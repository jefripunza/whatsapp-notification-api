const axios = require("axios");

module.exports = async () => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1,
      year = now.getFullYear();
    const result = await axios({
      url: `https://api-harilibur.vercel.app/api?month=${month}&year=${year}`,
    }).then((res) => res.data);
    return result;
  } catch (error) {
    console.log({ error });
    throw new Error(error.message);
  }
};
