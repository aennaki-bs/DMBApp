
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Using more explicit DOM element finding and error handling
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure there is a div with id 'root' in the HTML.");
}

createRoot(rootElement).render(<App />);
