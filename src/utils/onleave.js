const Tesseract = require("tesseract.js");

const { createPromise } = require("../helpers");

module.exports = async (validate_object) => {
  const validate_array = Object.keys(validate_object).map((key) => {
    return {
      id: key,
      image: validate_object[key],
    };
  });
  try {
    return await createPromise(validate_array, async ({ id, image }, i) => {
      if (!image) {
        return {
          id,
          text: "",
          isOnLeave: false,
        };
      }
      try {
        const result = await Tesseract.recognize(image);
        const text = String(result.data.text).toLowerCase().replace(/\n/g, "");

        let isOnLeave = String(text).includes("on leave");
        isOnLeave = isOnLeave ? true : String(text).includes("onleave");
        // aneh
        isOnLeave = isOnLeave ? true : String(text).includes("oniseave");
        isOnLeave = isOnLeave ? true : String(text).includes("on (eave");
        isOnLeave = isOnLeave ? true : String(text).includes("on .leava");
        isOnLeave = isOnLeave ? true : String(text).includes("ave");
        isOnLeave = isOnLeave ? true : String(text).includes("on");

        return {
          id,
          text,
          isOnLeave,
        };
      } catch (error) {
        return {
          id,
          error,
        };
      }
    });
  } catch (error) {
    throw new Error(error);
  }
};
