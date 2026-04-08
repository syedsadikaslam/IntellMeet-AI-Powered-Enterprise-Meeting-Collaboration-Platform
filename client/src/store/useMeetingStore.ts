import { create } from 'zustand';

interface MeetingState {
  stream: MediaStream | null;
  isMicOn: boolean;
  isVideoOn: boolean;
  setStream: (stream: MediaStream | null) => void;
  toggleMic: () => void;
  toggleVideo: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  setVideoEnabled: (enabled: boolean) => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
  stream: null,
  isMicOn: true,
  isVideoOn: true,
  setStream: (stream) => set({ stream }),
  toggleMic: () => set((state) => {
    if (state.stream) {
      state.stream.getAudioTracks().forEach(track => track.enabled = !state.isMicOn);
    }
    return { isMicOn: !state.isMicOn };
  }),
  toggleVideo: () => set((state) => {
    if (state.stream) {
      state.stream.getVideoTracks().forEach(track => track.enabled = !state.isVideoOn);
    }
    return { isVideoOn: !state.isVideoOn };
  }),
  setAudioEnabled: (enabled) => set((state) => {
    if (state.stream) {
      state.stream.getAudioTracks().forEach(track => track.enabled = enabled);
    }
    return { isMicOn: enabled };
  }),
  setVideoEnabled: (enabled) => set((state) => {
    if (state.stream) {
      state.stream.getVideoTracks().forEach(track => track.enabled = enabled);
    }
    return { isVideoOn: enabled };
  }),
}));
