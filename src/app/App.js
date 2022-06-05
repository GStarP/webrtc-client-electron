import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { Box } from '@mui/system';
import Button from '@mui/material/Button';

import Home from './pages/Home/Home';
import Room from './pages/Room/Room';

function App() {
  const nav = useNavigate();
  return (
    <Box
      sx={{
        bgcolor: '#EEE'
      }}
    >
      <Button onClick={() => nav('/main_window')}>HOME</Button>
      <Button onClick={() => nav('/main_window/room')}>ROOM</Button>
      <Routes>
        <Route path="/main_window" element={<Home />}></Route>
        <Route path="/main_window/room" element={<Room />}></Route>
      </Routes>
    </Box>
  );
}

export default App;
