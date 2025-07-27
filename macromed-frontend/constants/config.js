const hostApi =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1"
    : "https://flatlogic-ecommerce-backend.herokuapp.com";
const portApi =
  process.env.NODE_ENV === "development" ? "8000" : '';
const baseURLApi = `${hostApi}:${portApi}/api`;

export default {
  hostApi,
  portApi,
  baseURLApi,
  remote: "https://flatlogic-ecommerce-backend.herokuapp.com/api/:41521",
  isBackend: process.env.REACT_APP_BACKEND,
  app: {
    colors: {
      dark: "#002B49",
      light: "#FFFFFF",
      sea: "#004472",
      sky: "#E9EBEF",
      wave: "#D1E7F6",
      rain: "#CCDDE9",
      middle: "#D7DFE6",
      black: "#13191D",
      salat: "#21AE8C",
    },
  },
};
