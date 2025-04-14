import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { RecoilRoot } from "recoil";
import { Analytics } from "@vercel/analytics/react";
import "./css.css";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <RecoilRoot>
      <Analytics />
      <App />
    </RecoilRoot>
  </BrowserRouter>
);
