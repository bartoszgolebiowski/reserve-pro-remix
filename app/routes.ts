import {
  type RouteConfig,
  route
} from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx", [
    route("dashboard/owner", "routes/dashboard.owner.tsx", [
      route("locations", "routes/dashboard.owner.locations.tsx"),
    ]),
    route("dashboard/employee", "routes/dashboard.employee.tsx"),
  ]),
  route("auth/logout", "routes/auth.logout.tsx"),
  route("auth/login", "routes/auth.login.tsx"),
  route("auth/register", "routes/auth.register.tsx"),
  route("auth/register/success", "routes/auth.register.success.tsx"),
] satisfies RouteConfig;
