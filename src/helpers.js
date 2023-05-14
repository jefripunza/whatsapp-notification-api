exports.delay = async (timeout = 3000) =>
  await new Promise((resolve) => setTimeout(resolve, timeout));

/**
 * @callback processingCallback
 * @param {*} row - show per item.
 * @param {number} i - number of increment
 * @returns {Promise}
 */
/**
 * @param {any[]} array
 * @param {processingCallback} processing
 * @returns {Promise}
 */
exports.createPromise = async (array, processing) => {
  let i = 0;
  const result = [];
  while (i < array.length) {
    const row = array[i];
    result.push(await processing(row, i));
    i++;
  }
  return result;
};

exports.getFocusVariable = (str) => {
  if (!str) return [];
  let rows = String(str).match(/#(\w+)#/g);
  if (!rows) return [];
  rows = rows.map((match) => String(match).replace(/#/g, ""));
  return rows;
};

exports.getAtSignVariable = (str, excepts = []) => {
  if (!str) return [];
  const regex = /@(\w+)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(str))) {
    if (!excepts.includes(match[1])) matches.push(match[1]);
  }
  return matches.map((v) => String(v).toLowerCase());
};

exports.sampleToHTML = (str) => {
  if (!str) return ""; // *bold* _italic_ ~strikethrough~ ```monospace```
  let result = String(str).split("\n").join("</br>"); // enter
  let bold = String(result).match(/\*(\w+)\*/g);
  if (bold) {
    result = bold.reduce((simpan, value) => {
      return String(simpan).replace(
        new RegExp(`*${value}*`, "g"),
        `<b>${value}</b>`
      );
    }, result);
  }
  let italic = String(result).match(/\_(\w+)\_/g);
  if (italic) {
    result = italic.reduce((simpan, value) => {
      return String(simpan).replace(
        new RegExp(`_${value}_`, "g"),
        `<i>${value}</i>`
      );
    }, result);
  }
  let strikethrough = String(result).match(/\~(\w+)\~/g);
  if (strikethrough) {
    result = strikethrough.reduce((simpan, value) => {
      return String(simpan).replace(
        new RegExp(`~${value}~`, "g"),
        `<s>${value}</s>`
      );
    }, result);
  }
  let monospace = String(result).match(/\`\`\`(\w+)\`\`\`/g);
  if (monospace) {
    result = monospace.reduce((simpan, value) => {
      return String(simpan).replace(
        new RegExp(`\`\`\`${value}\`\`\``, "g"),
        `<p class="monospace-text">${value}</p>`
      );
    }, result);
  }
  return result;
};

exports.onlyNumber = (str) => str.replace(/[^0-9]/g, "");
