const str =
  "this is example string to match #anu# value or #ini# and # itu# value";

const result = String(str)
  .match(/#(\w+)#/g)
  .map((match) => String(match).replace(/#/g, ""));

console.log({ result });
