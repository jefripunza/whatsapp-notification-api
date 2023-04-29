const Tesseract = require("tesseract.js");

const { createPromise } = require("../helpers");

const ReadText = async (
  imgfile,
  tessedit_ocr_engine_mode = 2,
  tessedit_pageseg_mode = 3
) => {
  try {
    return await new Promise(async (resolve, reject) => {
      const worker = await Tesseract.createWorker({
        // logger: (m) => console.log(m),
      });
      worker.loadLanguage("eng+osd").then(() => {
        worker.initialize("eng+osd").then(() => {
          worker
            .setParameters({
              tessedit_ocr_engine_mode,
              tessedit_pageseg_mode,
              tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
            })
            .then(() => {
              worker
                .recognize(imgfile, {
                  tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
                })
                .then(({ data: { text } }) => {
                  // console.log(text)
                  resolve(text);
                })
                .finally(() => {});
            });
        });
      });
    });
  } catch (e) {
    return `An error occurred: ${e}`;
  }
};

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
        const result = await ReadText(image);
        const text = String(result).toLowerCase().replace(/\n/g, "");

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
