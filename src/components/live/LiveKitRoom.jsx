import React, { useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import { Radio } from "lucide-react";

export default function LiveKitRoom({ token, url, mode }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");

  useEffect(() => {
    let disposed = false;
    let localStream = null;

    if (url === "local") {
      (async () => {
        if (mode === "publisher" && navigator.mediaDevices?.getUserMedia) {
          try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (!disposed && videoRef.current) {
              videoRef.current.srcObject = localStream;
              setStatus("live");
              return;
            }
          } catch {
            // Camera unavailable or permission denied — fall back to simulated live broadcast
          }
        }
        if (!disposed) setStatus("simulated");
      })();

      return () => {
        disposed = true;
        localStream?.getTracks().forEach((t) => t.stop());
      };
    }

    const room = new Room({ adaptiveStream: true, dynacast: true });

    const attachTrack = (track) => {
      if (disposed) return;
      if (track.kind === Track.Kind.Video && videoRef.current) {
        track.attach(videoRef.current);
      } else if (track.kind === Track.Kind.Audio) {
        track.attach();
      }
    };

    room.on(RoomEvent.TrackSubscribed, attachTrack);
    room.on(RoomEvent.TrackUnsubscribed, (track) => {
      try {
        track.detach();
      } catch {
        /* ignore */
      }
    });
    room.on(RoomEvent.Disconnected, () => {
      if (!disposed) setStatus("ended");
    });

    (async () => {
      try {
        await room.connect(url, token);
        if (disposed) {
          room.disconnect();
          return;
        }
        if (mode === "publisher") {
          await room.localParticipant.setCameraEnabled(true);
          await room.localParticipant.setMicrophoneEnabled(true);
          const pub = room.localParticipant.getTrackPublication(Track.Source.Camera);
          if (pub?.track && videoRef.current) pub.track.attach(videoRef.current);
        } else {
          room.remoteParticipants.forEach((p) => {
            p.getTrackPublications().forEach((pub) => {
              if (pub.track) attachTrack(pub.track);
            });
          });
        }
        if (!disposed) setStatus("live");
      } catch (e) {
        if (!disposed) {
          setStatus("error");
          setError(e.message || "Failed to connect to the live video.");
        }
      }
    })();

    return () => {
      disposed = true;
      try {
        room.disconnect();
      } catch {
        /* ignore */
      }
    };
  }, [token, url, mode]);

  return (
    <div className="relative h-full w-full bg-black">
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
      {status === "connecting" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">Connecting to stream…</div>
      )}
      {status === "simulated" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 px-6 text-center">
          <span className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-red-500/20 text-red-400">
            <Radio className="h-7 w-7 animate-pulse" />
          </span>
          <p className="font-display text-lg font-semibold text-white">Local Live Preview</p>
          <p className="mt-1 max-w-sm text-xs text-white/70">
            Running in local IndexedDB mode. Live chat is active on the right and persists across reloads and tabs.
          </p>
        </div>
      )}
      {status === "ended" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-center">
          <div>
            <p className="font-display text-lg text-white">Stream ended</p>
            <p className="mt-1 text-xs text-white/60">Thanks for watching</p>
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-4 text-center text-sm text-white/80">
          {error || "Unable to load the live video."}
        </div>
      )}
    </div>
  );
}
