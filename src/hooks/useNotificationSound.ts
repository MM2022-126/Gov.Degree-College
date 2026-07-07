import { useCallback, useRef } from "react";

const NOTIFICATION_FREQUENCY = 800;
const NOTIFICATION_DURATION = 150;

export const useNotificationSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(NOTIFICATION_FREQUENCY, ctx.currentTime);
      oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + NOTIFICATION_DURATION / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + NOTIFICATION_DURATION / 1000);
    } catch {
      // Audio not supported
    }
  }, []);

  return play;
};
