declare module 'simple-peer' {
  import { EventEmitter } from 'events';

  namespace SimplePeer {
    interface Options {
      initiator?: boolean;
      trickle?: boolean;
      stream?: MediaStream;
      config?: RTCConfiguration;
    }

    interface Instance extends EventEmitter {
      new (options?: Options): Instance;
      signal(data: any): void;
      send(data: any): void;
      addStream(stream: MediaStream): void;
      removeStream(stream: MediaStream): void;
      addTrack(track: MediaStreamTrack, stream: MediaStream): void;
      removeTrack(track: MediaStreamTrack, stream: MediaStream): void;
      replaceTrack(oldTrack: MediaStreamTrack, newTrack: MediaStreamTrack, stream: MediaStream): void;
      destroy(err?: Error): void;
    }
  }

  const SimplePeer: SimplePeer.Instance;
  export = SimplePeer;
}
