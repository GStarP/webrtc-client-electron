import React from 'react';
import ReactDOM from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { HashRouter } from 'react-router-dom';

import App from './app/App';

import './index.css';
import Hint from './app/utils/hint';

const root = ReactDOM.createRoot(document.getElementById('root'));

// change default font-family
const theme = createTheme({
  typography: {
    fontFamily: 'MiSans-Normal'
  }
});

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
);

// init Hint
Hint.init({ alert: true, loading: true });

const close = Hint.Loading.show('创建房间中');
setTimeout(() => close(), 2000);
