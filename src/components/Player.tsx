import {
  ControlBar,
  LivelyPlayerUiContext,
  MediaContainer,
  PlayerAudioButton,
  PlayerBitrateButton,
  PlayerFullscreenButton,
  PlayerGetSoundButton,
  PlayerNewWindowButton,
  PlayerOverlayButton,
  PlayerPlayButton,
  PlayerVideo,
  PlayerVolumeRange,
} from "@livelyvideo/video-client-web";
import React, { useContext, useEffect } from "react";

const Player = () => {
  const playerCtx = useContext(LivelyPlayerUiContext);

  useEffect(() => {
    if (playerCtx) {
      playerCtx.player.localVideoPaused = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MediaContainer>
      <PlayerGetSoundButton />
      <PlayerVideo />
      <ControlBar variant="player">
        <PlayerPlayButton />
        <PlayerAudioButton />
        <PlayerVolumeRange />
        <PlayerBitrateButton classNames="lv-push-left" />
        <PlayerFullscreenButton />
        <PlayerNewWindowButton />
      </ControlBar>
      <PlayerOverlayButton />
    </MediaContainer>
  );
};

export default Player;