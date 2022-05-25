import React, { createRef, useEffect } from 'react';
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
  const localVideo = createRef();
  const remoteVideo = createRef();

  let pc;
  const onMsg = (data) => {
    // client1 ready, client2 receive but not ready
    if (!localStream) {
      console.log('not ready yet');
      return;
    }
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
      default:
        console.log('unhandled', data);
        break;
    }
  };

  const start = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    localVideo.current.srcObject = localStream;

    socket.emit('msg', { type: 'ready' });
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
    pc.ontrack = (e) => (remoteVideo.current.srcObject = e.streams[0]);
    // attach local stream
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
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
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  return (
    <div className="app">
      <h1>WebRTC Client</h1>
      <video ref={localVideo} autoPlay muted playsInline />
      <input ref={signalingServerInput} defaultValue="localhost"></input>
      <div>
        <button onClick={connectSignalingServer}>Online</button>
        <button onClick={start}>Start</button>
        <button onClick={cancel}>Cancel</button>
      </div>
      <video ref={remoteVideo} autoPlay playsInline />
    </div>
  );
}

export default App;
