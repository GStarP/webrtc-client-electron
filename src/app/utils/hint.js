import { Alert } from '@mui/material';
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom/client';

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
    if (config.dialog) {
      this.Dialog.init(this, el);
    }
  },
  Alert: {
    el: null,
    root: null,
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
        'margin-top: 24px; min-width: 320px; transition: opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;';
      container.appendChild(this.el);
      this.root = ReactDOM.createRoot(this.el);
    },
    // render Alert with specific config
    render(config) {
      if (!this.el || !this.root) return;
      config = {
        ...this.defaultConfig,
        ...config
      };
      this.root.render(<Alert severity={config.type}>{config.text}</Alert>);
      this.el.style.visibility = 'visible';
      this.el.style.opacity = '1';
      setTimeout(() => {
        this.el.style.opacity = '0';
        // hide after animation
        setTimeout(() => {
          this.el.style.visibility = 'hidden';
        }, 225);
      }, config.time);
    },
    // quick func
    success(text) {
      this.render({
        text
      });
    },
    error(text) {
      this.render({
        type: 'error',
        text
      });
    }
  },
  Dialog: {
    el: null,
    init(container) {}
  }
};

export default Hint;
