import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { RecoilRoot } from "recoil";
import { Analytics } from "@vercel/analytics/react";
import "./css.css";

createRoot(document.getElementById("root")!).render(
  <RecoilRoot>
    <Analytics />
    <App />
  </RecoilRoot>
);
