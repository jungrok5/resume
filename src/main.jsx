import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './theme.css'

// NOTE: React.StrictMode is intentionally omitted. Its dev-only double-mount
// makes drei's <ScrollControls> call createRoot() twice on the same container
// (throws in dev). R3F/drei apps conventionally run without StrictMode.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
