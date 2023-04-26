exports.delay = async (timeout = 3000) =>
  await new Promise((resolve) => setTimeout(resolve, timeout));

exports.getFocusVariable = (str) => {
  if (!str) return [];
  let rows = String(str).match(/#(\w+)#/g);
  if (!rows) return [];
  rows = rows.map((match) => String(match).replace(/#/g, ""));
  return rows;
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