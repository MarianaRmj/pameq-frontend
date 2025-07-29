// src/routes/index.ts

export const routes = {
  login: "/login",
  requestPassword: "/recover/reset-password",
  resetPassword: (token: string) => `/recover/reset-password/${token}`,
  dashboard: "/dashboard",
  parameterization: {
    base: "/dashboard/parameterization",
    editarInstitucion: (id: number) => `/dashboard/parameterization/${id}/edit`,
    nuevaInstitucion: "/dashboard/parameterization/new",
  },
  // Puedes agregar más secciones aquí:
  usuarios: {
    base: "/dashboard/users",
  },
  pamec: {
    base: "/dashboard/pamec",
  },
};
