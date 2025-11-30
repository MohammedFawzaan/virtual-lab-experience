import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { UserContext } from './context/UserContext.tsx';

createRoot(document.getElementById("root")!).render(<UserContext><App /></UserContext>);
