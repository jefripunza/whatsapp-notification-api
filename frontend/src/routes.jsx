import React from "react";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./error-page";

import Auth from "./pages/Auth";
import Dashboard from "./pages/menu/Dashboard";
import Templates from "./pages/menu/Templates";

export default createBrowserRouter([
  {
    path: "/",
    element: <Auth />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    element: <Dashboard />,
    icon: "grid_view",
    errorElement: <ErrorPage />,
  },
  {
    path: "/templates",
    name: "Templates",
    element: <Templates />,
    icon: "receipt_long",
    errorElement: <ErrorPage />,
  },
  {
    path: "/messages",
    name: "Messages",
    element: <Dashboard />,
    icon: "mail_outline",
    errorElement: <ErrorPage />,
  },
]);
