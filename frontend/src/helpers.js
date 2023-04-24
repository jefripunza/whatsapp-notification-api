export const delay = async (timeout = 3000) =>
  await new Promise((resolve) => setTimeout(resolve, timeout));

export const getFocusVariable = (str) => {
  if (!str) return [];
  let rows = String(str).match(/#(\w+)#/g);
  if (!rows) return [];
  rows = rows.map((match) => String(match).replace(/#/g, ""));
  return rows;
};
