import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Registration from "./pages/Registration.jsx";
import LoginPage from "./pages/Login.jsx";
import MemberRegistration from "./pages/MemberRegister.jsx";
import TrainerDash from "./pages/TrainerDash.jsx";
import TrainerRegistration from "./pages/TrainerRegistration.jsx";
import MemberDash from "./pages/MemberDash.jsx";
import "./index.css";
import App from "./App.jsx";
import MealLibrary from "./pages/MealLibrary.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/register",
    element: <Registration />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/MemberRegistration",
    element: <MemberRegistration />,
  },
  {
    path: "/MemberDash",
    element: <MemberDash />,
  },
  {
    path: "/TrainerRegistration",
    element: <TrainerRegistration />,
  },
  {
    path: "/TrainerDash",
    element: <TrainerDash />,
  },
  {
    path: "/TrainerRegistration",
    element: <TrainerRegistration />,
  },
  {
    path: "/MealLibrary",
    element: <MealLibrary />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
