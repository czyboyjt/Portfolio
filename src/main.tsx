import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// A refresh always starts at the top: stop the browser restoring the old scroll position, and drop any #hash
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
window.scrollTo(0, 0);

createRoot(document.getElementById('root')!).render(<App />);
