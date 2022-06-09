import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Box } from '@mui/system';

import Home from './pages/Home/Home';
import Room from './pages/Room/Room';

function App() {
  return (
    <Box
      sx={{
        height: '100%',
        '>div': {
          height: '100%'
        }
      }}
    >
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/room" element={<Room />}></Route>
      </Routes>
    </Box>
  );
}

export default App;
