declare global {
  interface Window {
    seline: {
      track: (eventName: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export const selineTrack = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.seline) {
    return window.seline.track(eventName, properties);
  }
};
