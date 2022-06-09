import React from 'react';
import { to } from '../../utils/route';

function Room() {
  return (
    <div>
      <button onClick={() => to('/')}>back</button>
    </div>
  );
}

export default Room;
