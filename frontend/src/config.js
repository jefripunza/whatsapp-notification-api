// "undefined" means the URL will be computed from the `window.location` object
export const URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:4000";
