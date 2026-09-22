import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/crimson-text/400.css';
import '@fontsource-variable/inter/wght.css';
import './styles/tokens.css';
import './styles/typography.css';
import './styles/base.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
