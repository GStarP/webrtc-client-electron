import React, { createRef, useState } from 'react';
import { io } from 'socket.io-client';

import './App.css';

function App() {
  // connect to signaling server
  const signalingServerInput = createRef();
  let socket = null;
  const connectSignalingServer = () => {
    if (socket) {
      socket = null;
    }
    const ip = signalingServerInput.current.value;
    socket = io(`http://${ip}:8080`);

    socket.on('connect', () => {
      console.log('online');
    });

    socket.on('msg', onMsg);
  };

  // capture local video
  let localStream;
  let remoteStream;
  const localVideo = createRef();
  const remoteVideo = createRef();

  let pc;
  const onMsg = (data) => {
    switch (data.type) {
      case 'offer':
        handleOffer(data);
        break;
      case 'answer':
        handleAnswer(data);
        break;
      case 'candidate':
        handleCandidate(data);
        break;
      case 'ready':
        // client1 ready, client2 receive but not ready
        if (!localStream) {
          console.log('not ready yet');
          return;
        }
        // client2 ready, client1 receive and call
        if (pc) {
          console.log('already in call, ignoring');
          return;
        }
        makeCall();
        break;
      case 'bye':
        if (pc) {
          hangup();
        }
        break;
      case 'control':
        recvControl();
        break;
      case 'control_ready':
        startControl();
        break;
      case 'move_mouse':
        moveMouse(data.pos);
        break;
      default:
        console.log('unhandled', data);
        break;
    }
  };

  const ready = () => {
    socket.emit('msg', { type: 'ready' });
  };

  const start = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    localVideo.current.srcObject = localStream;
  };

  function createPeerConnection() {
    pc = new RTCPeerConnection();
    pc.onicecandidate = (e) => {
      const message = {
        type: 'candidate',
        candidate: null
      };
      if (e.candidate) {
        message.candidate = e.candidate.candidate;
        message.sdpMid = e.candidate.sdpMid;
        message.sdpMLineIndex = e.candidate.sdpMLineIndex;
      }
      socket.emit('msg', message);
    };
    // attach remote stream
    pc.ontrack = (e) => {
      remoteStream = e.streams[0];
      remoteVideo.current.srcObject = remoteStream;
    };
    // attach local stream
    if (localStream)
      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));
  }

  async function makeCall() {
    await createPeerConnection();

    const offer = await pc.createOffer();
    socket.emit('msg', { type: 'offer', sdp: offer.sdp });
    await pc.setLocalDescription(offer);
  }

  async function handleOffer(offer) {
    if (pc) {
      console.error('existing peerconnection');
      return;
    }
    await createPeerConnection();
    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    socket.emit('msg', { type: 'answer', sdp: answer.sdp });
    await pc.setLocalDescription(answer);
  }

  async function handleAnswer(answer) {
    if (!pc) {
      console.error('no peerconnection');
      return;
    }
    await pc.setRemoteDescription(answer);
  }

  async function handleCandidate(candidate) {
    if (!pc) {
      console.error('no peerconnection');
      return;
    }
    if (!candidate.candidate) {
      await pc.addIceCandidate(null);
    } else {
      await pc.addIceCandidate(candidate);
    }
  }

  const cancel = async () => {
    hangup();
    socket.emit('msg', { type: 'bye' });
  };

  async function hangup() {
    if (pc) {
      pc.close();
      pc = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      localStream = null;
    }
  }

  /**
   * capture screen
   */
  // ask main process to capture screen
  // many window share one main process
  if (window.T.getScreenSource() === null)
    window.T.ipcRenderer.send('CAPTURE_SCREEN');
  const captureScreen = async () => {
    // get screen source info
    const screenSourceInfo = window.T.getScreenSource();
    if (!screenSourceInfo) {
      console.error('no screen source info');
      return;
    }
    // get video stream, then attach
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: screenSourceInfo.id
        }
      }
    });
    localStream = stream;
    localVideo.current.srcObject = stream;
  };

  /**
   * control screen
   */
  const controlScreen = () => {
    socket.emit('msg', { type: 'control' });
  };

  const recvControl = () => {
    if (localStream) {
      socket.emit('msg', {
        type: 'control_ready'
      });
    }
  };

  const startControl = () => {
    showControlView(remoteStream);
  };

  // control mouse move
  const throttle = (func, interval) => {
    let pre = 0;
    return function () {
      const cur = performance.now();
      const context = this;
      if (cur - pre >= interval) {
        func.apply(context, arguments);
        pre = cur;
      }
    };
  };
  // 30 fps move mouse
  const onMouseMove = throttle((e) => {
    console.log(e);
    socket.emit('msg', { type: 'move_mouse', pos: [e.clientX, e.clientY] });
  }, 30);
  // show/quit fullscreen control view
  let controlView = createRef();
  let [controlViewShow, setControlViewShow] = useState(false);
  // when show, add event listeners
  const showControlView = (stream) => {
    const config = stream.getVideoTracks()[0].getSettings();
    window.T.ipcRenderer.send('RESIZE', {
      width: config.width,
      height: config.height
    });
    setControlViewShow(true);
    controlView.current.srcObject = stream;
    document.addEventListener('keyup', quitControlView);
    document.addEventListener('mousemove', onMouseMove);
  };
  // when quit, remove event listeners
  const quitControlView = (e) => {
    // esc
    if (e.keyCode === 27) {
      setControlViewShow(false);
      document.removeEventListener('keyup', quitControlView);
      document.removeEventListener('mousemove', onMouseMove);
    }
  };

  const moveMouse = (pos) => {
    window.T.ipcRenderer.send('MOVE_MOUSE', pos);
  };

  return (
    <div className="app">
      <h1>WebRTC Client</h1>
      <video ref={localVideo} autoPlay muted playsInline />
      <input ref={signalingServerInput} defaultValue="localhost"></input>
      <div>
        <button onClick={connectSignalingServer}>Online</button>
        <button onClick={start}>Start</button>
        <button onClick={captureScreen}>Capture Screen</button>
        <button onClick={ready}>Ready</button>
        <button onClick={controlScreen}>Control Screen</button>
        <button onClick={cancel}>Cancel</button>
      </div>
      <video ref={remoteVideo} autoPlay playsInline />
      <video
        id="controlView"
        ref={controlView}
        style={{
          display: controlViewShow ? 'block' : 'none'
        }}
        autoPlay
        playsInline
      ></video>
    </div>
  );
}

export default App;
