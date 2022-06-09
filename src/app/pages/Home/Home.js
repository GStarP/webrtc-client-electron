import React, { Fragment, useState } from 'react';
import { to } from '../../utils/route';
import { Button, Card, Typography } from '@mui/material';
import ResetTvIcon from '@mui/icons-material/ResetTv';
import SplitInput from '../../components/SplitInput';
import { Box } from '@mui/system';
import Hint from '../../utils/hint';

function Home() {
  const [inJoin, setInJoin] = useState(false);

  /**
   * Home
   */
  const createRoom = () => {
    // TODO: create room logic
    to('/room');
  };

  const joinRoom = () => {
    setInJoin(true);
  };

  /**
   * Join
   */
  let rid = '';
  const onRIDChange = (value) => {
    rid = value;
  };

  const ridLen = 4;
  const confirmJoin = () => {
    if (rid.length < ridLen) {
      Hint.Alert.error('请输入完整的房间号码');
      return;
    }
    console.log(rid);
    // TODO: join room logic
    to('/room');
  };

  return (
    <Box
      className="flex-row flex-center"
      sx={{
        pb: 4,
        bgcolor: 'cornflowerblue'
      }}
    >
      <Card
        className="flex-col flex-center"
        sx={{
          width: 320,
          padding: '2rem 2.5rem 4rem 2.5rem',

          button: {
            width: '100%',
            fontSize: 15
          },
          '.split-input': {
            mb: 3,
            input: {
              width: 36,
              height: 52,
              textAlign: 'center',
              fontSize: 24,
              border: '1px solid #000',
              borderRadius: '4px',
              outlineColor: '#1976d2',
              margin: '0 8px'
            }
          }
        }}
      >
        <Box
          className="flex-row flex-center"
          sx={{
            mb: 4
          }}
        >
          <ResetTvIcon sx={{ mr: 1.5, fontSize: 30 }} />
          <Typography variant="h5">WebRTC</Typography>
        </Box>
        {!inJoin ? (
          <Fragment>
            <Button
              variant="contained"
              disableElevation
              onClick={createRoom}
              sx={{
                mb: 3
              }}
            >
              创建房间
            </Button>
            <Button variant="contained" disableElevation onClick={joinRoom}>
              加入房间
            </Button>
          </Fragment>
        ) : (
          <Fragment>
            <SplitInput num={ridLen} onChange={onRIDChange} />
            <Button
              variant="contained"
              disableElevation
              onClick={confirmJoin}
              sx={{
                mb: 1.5
              }}
            >
              确认
            </Button>
            <Button
              variant="outlined"
              disableElevation
              onClick={() => setInJoin(false)}
            >
              返回
            </Button>
          </Fragment>
        )}
      </Card>
    </Box>
  );
}

export default Home;
