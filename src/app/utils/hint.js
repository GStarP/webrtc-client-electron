import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import ReactDOM from 'react-dom/client';

const theme = createTheme({
  typography: {
    fontFamily: 'DIY-Font'
  }
});

const Hint = {
  el: null,
  init(config) {
    // create container
    this.el = document.createElement('div');
    this.el.id = 'hint';
    this.el.className = 'flex-col flex-center';
    this.el.style = 'position: absolute; top: 0; left: 0; right: 0;';
    document.body.appendChild(this.el);
    // init needed component
    if (config.alert) {
      this.Alert.init(this.el);
    }
    if (config.loading) {
      this.Loading.init(this.el);
    }
    if (config.dialog) {
      this.Dialog.init(this.el);
    }
  },
  Alert: {
    el: null,
    root: null,
    timer: null,
    defaultConfig: {
      type: 'success',
      text: '',
      time: 1500
    },
    // create Alert's container and react root
    init(container) {
      this.el = document.createElement('div');
      this.el.id = 'alert';
      this.el.style =
        'margin-top: 24px; min-width: 320px; display: none; opacity: 0; transition: opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;';
      container.appendChild(this.el);
      this.root = ReactDOM.createRoot(this.el);
    },
    // show Alert with specific config
    show(config) {
      if (!this.el || !this.root) return;
      config = {
        ...this.defaultConfig,
        ...config
      };
      this.root.render(
        <ThemeProvider theme={theme}>
          <Alert severity={config.type}>{config.text}</Alert>
        </ThemeProvider>
      );
      this.el.style.display = 'block';
      // delay opacity change to promise animation
      setTimeout(() => {
        this.el.style.opacity = '1';
      }, 100);

      // avoid [click1] timer close [click2] alert
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.el.style.opacity = '0';
        // remove after animation
        setTimeout(() => {
          this.el.style.display = 'none';
        }, 225);
      }, config.time);
    },
    // quick func
    success(text) {
      this.show({
        text
      });
    },
    error(text) {
      this.show({
        type: 'error',
        text
      });
    }
  },
  Loading: {
    el: null,
    root: null,
    init(container) {
      this.el = document.createElement('div');
      this.el.id = 'loading';
      container.appendChild(this.el);
      this.root = ReactDOM.createRoot(this.el);
    },
    show(text) {
      this.root.render(
        <Dialog open={true}>
          <Box
            className="flex-col flex-center"
            sx={{
              px: 3,
              pt: 2.5,
              pb: 4,
              minWidth: 240,
              fontFamily: 'DIY-Font'
            }}
          >
            <Box sx={{ mb: 2.5 }}>{text}</Box>
            <CircularProgress />
          </Box>
        </Dialog>
      );
    },
    close() {
      this.root.render(<Dialog open={false}></Dialog>);
    }
  },
  Dialog: {
    el: null,
    root: null,
    defaultConfig: {
      title: '提示',
      text: '',
      cancel: '取消',
      confirm: '确认'
    },
    init(container) {
      this.el = document.createElement('div');
      this.el.id = 'dialog';
      container.appendChild(this.el);
      this.root = ReactDOM.createRoot(this.el);
    },
    show(config) {
      config = {
        ...this.defaultConfig,
        ...config
      };
      const promise = new Promise((resolve, reject) => {
        this.root.render(
          <Dialog open={true}>
            <ThemeProvider theme={theme}>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ minWidth: 320 }}>
                  {config.text}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    this.close();
                    reject();
                  }}
                >
                  {config.cancel}
                </Button>
                <Button
                  onClick={() => {
                    this.close();
                    resolve();
                  }}
                >
                  {config.confirm}
                </Button>
              </DialogActions>
            </ThemeProvider>
          </Dialog>
        );
      });
      return promise;
    },
    close() {
      this.root.render(<Dialog open={false}></Dialog>);
    },
    confirm(text) {
      return this.show({
        text
      });
    }
  }
};

export default Hint;
