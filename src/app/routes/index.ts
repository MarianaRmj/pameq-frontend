export const routes = {
  login: "/login",
  requestPassword: "/recover/reset-password",
  resetPassword: (token: string) => `/recover/reset-password/${token}`,
  dashboard: "/dashboard",
};
