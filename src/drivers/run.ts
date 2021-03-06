import { exec } from 'child_process';
import { ChildProcess } from 'child_process';
import xs, { Listener, Stream } from 'xstream';

export enum RunEventType {
  Action = 1,
  Connect,
  Disconnect,
  Noop,
}

export enum RunMessageType {
  STD_OUT = 1,
  STD_ERR,
  DISCONNECTED,
  CONNECTED,
}

export type RunMessage = { type: RunMessageType, message: string };
export type RunEvent = { type: RunEventType, payload: string };
export type RunDriver = (outgoing$: Stream<RunEvent>) => Stream<RunMessage>;

export function errMessage(message: string): RunMessage {
  return { type: RunMessageType.STD_ERR, message };
}
export function outMessage(message: string): RunMessage {
  return { type: RunMessageType.STD_OUT, message };
}
export function connectMessage(): RunMessage {
  return { type: RunMessageType.CONNECTED, message: '' };
}
export function disconnectedMessage(): RunMessage {
  return { type: RunMessageType.DISCONNECTED, message: '' };
}

export function makeRunDriver(): RunDriver {

  // tslint:disable-next-line:interface-over-type-literal
  type State = { listener: Listener<RunMessage>|null, connection: ChildProcess|null };
  const state: State = {
    connection: null,
    listener: null,
  };

  const connectTo = (payload: string) => {
    if (!payload) {
      return;
    }

    if (state.connection && state.connection.disconnect) {
      state.connection.disconnect();
    }

    state.connection = exec(payload, (err: Error) => {
      if (state.listener === null) {
        return;
      }
      state.listener.next(disconnectedMessage());
      if (err) {
        // tslint:disable-next-line:no-console
        console.log('Run exec received an error', err);
        state.connection = null;
      }
      console.log('connected');
    });
    if (state.listener) {
      state.listener.next(connectMessage());
    }

    state.connection.stdout.on('data', (chunk: string) => {
      if (!state.listener) {
        return;
      }
      state.listener.next(outMessage(chunk));
    });

    state.connection.stderr.on('data', (chunk: string) => {
      if (!state.listener) {
        return;
      }
      state.listener.next(errMessage(chunk));
    });
  };

  const writeToConnection = (payload: string) => {
    if (!state.connection) {
      return;
    }
    if (!payload) {
      return;
    }
    const con: ChildProcess = state.connection;
    con.stdin.write(payload);
  };

  const connection = xs.create<RunMessage>({
    start: (listener: Listener<RunMessage>) => {
      state.listener = listener;
    },
    stop: () => {},
  });

  const disconnect = () => {
    if (!state.connection) {
      return;
    }
    // Todo: send a proper LSP exit.
    state.connection.kill();
  };

  function runDriver(outgoing$: Stream<RunEvent>): Stream<RunMessage> {
    outgoing$.addListener({
      next: ({ type, payload }) => {
        switch (type) {
          case RunEventType.Action:
            writeToConnection(payload);
            break;
          case RunEventType.Connect:
            connectTo(payload);
            break;
          case RunEventType.Disconnect:
            disconnect();
            break;
          case RunEventType.Noop:
            // Do nothing.
            break;
          default:
            // tslint:disable-next-line:no-console
            console.log('Unknown action type', type, payload);
            return;
        }
      },
      error: () => {},
      complete: () => {},
    });
    return connection.remember();
  }

  return runDriver;
}
