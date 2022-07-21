import './App.css';

import {
  LivelyCallContext,
  LivelyPlayerUiContext,
  PlayerUiState,
  VideoClient,
  types,
} from "@livelyvideo/video-client-web";
import React, { useEffect, useReducer, useState } from 'react';

import Player from './components/Player';
import { tokenRefresher } from './utils/token-refresher';
import { uuidv4 } from './utils/uuid';

const livelyEndpoint = 'https://lively-dev-usc1a.livelyvideo.tv';
const callId = 'd6445fce-7021-4196-9fe6-4ae97d632df9';

const playerReducer = (players, action): Array<{ id: string; uiState: PlayerUiState }> => {
  switch (action.type) {
    case "addPlayer":
       return [...players, { id: action.ev.peer.peerId, uiState: new PlayerUiState(action.ev.player) }];
  case "removePlayer":
     return players.reduce((acc, player) => {
       if (player.playerUi.player === action.ev.player) {
         player.playerUi.dispose();
         return acc;
       }
       acc.push(player);
       return acc;
     }, []);
   case "unmount":
     return players.reduce((acc, player) => {
       player.playerUi.dispose();
       return acc;
     }, []);
    default:
      throw new Error();
 }
};

function App() {
  const [videoClient, setVideoClient] = useState<types.VideoClientAPI | null>(null);
  const [call, setCall] = useState<types.CallAPI | null>(null);
  const [players, setPlayers] = useReducer(playerReducer, []);;

  useEffect(() => {
    if (videoClient == null) {
      const opts: types.VideoClientOptions = {
        livelyEndpoints: [livelyEndpoint],
        token: tokenRefresher({
          livelyEndpoint,
          authUrl: `${livelyEndpoint}/api/demo/v1/access-token`,
          streamKey: uuidv4(),
          scope: 'conference-owner',
          clientReferrer: 'demo',
        }),
        loggerConfig: {
          clientName: 'your-app-name',
          writeLevel: 'debug',
        },
      };
  
      const newVC = new VideoClient(opts);
      newVC.on("playerAdded", (ev) => {
        setPlayers({ type: "addPlayer", ev });
      });
      newVC.on("playerRemoved", (ev) => {
        setPlayers({ type: "removePlayer", ev });
      });
  
      setVideoClient(newVC);
    }
    return () => {
      if (videoClient != null) {
        setPlayers({ type: "unmount" });
        videoClient.removeAllListeners("playerAdded");
        videoClient.removeAllListeners("playerRemoved");
        videoClient.dispose();
        setVideoClient(null);
      }
    };
  }, [videoClient]);

  useEffect(() => {
    if (callId && videoClient && call == null) {
      (async () => {
        const joinedCall = await videoClient.joinCall(callId, {});
        setCall(joinedCall);
      })();
    }
    return () => {
      if (call != null) {
        setCall(null);
      }
    };
  }, [videoClient, call]);

  return (
    <LivelyCallContext.Provider value={call}>
      {players.map((player) => {
        return (
          player.uiState != null && (
            <LivelyPlayerUiContext.Provider value={player.uiState} key={player.id}>
              <Player />
            </LivelyPlayerUiContext.Provider>
          )
        );
      })}
      ;
    </LivelyCallContext.Provider>
  );
}

export default App;
