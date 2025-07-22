import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle unhandled promise rejections globally
window.addEventListener('unhandledrejection', (event) => {
  // Log the error for debugging but prevent console errors
  console.debug('Handled promise rejection:', event.reason);
  event.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
