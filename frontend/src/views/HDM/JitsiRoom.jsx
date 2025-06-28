import React, { useEffect, useRef } from "react";

const JitsiRoom = ({ roomName, userDisplayName, durationMinutes = 30, onClose }) => {
  const jitsiContainerRef = useRef(null);
  const domain = "meet.jit.si"; // veya kendi Jitsi server'ınız

  useEffect(() => {
    const options = {
      roomName,
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: userDisplayName,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableModeratorIndicator: false,
        enableWelcomePage: false,
      },
      interfaceConfigOverwrite: {
        TILE_VIEW_MAX_COLUMNS: 2,
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_REMOTE_DISPLAY_NAME: 'Katılımcı',
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'chat', 'raisehand', 'tileview', 'fullscreen', 'hangup'
        ],
      }
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);

    // Otomatik olarak tileView aktifleştir
    api.addEventListener("videoConferenceJoined", () => {
      api.executeCommand("toggleTileView");
    });

    // Süre sınırlaması (isteğe bağlı)
    const timeout = setTimeout(() => {
      api.executeCommand("hangup");
      onClose && onClose();
    }, durationMinutes * 60 * 1000);

    return () => {
      clearTimeout(timeout);
      api.dispose();
    };
  }, [roomName, userDisplayName, durationMinutes, onClose]);

  return (
    <div>
      <div
        ref={jitsiContainerRef}
        style={{ width: "100%", height: "600px", borderRadius: "10px", overflow: "hidden" }}
      />
    </div>
  );
};

export default JitsiRoom;
