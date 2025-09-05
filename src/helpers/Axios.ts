import ax from "axios";

const axios = ax.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// axios.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response.status === 401) window.location.href = "/";
//     return Promise.reject(err);
//   }
// );

export default axios;
