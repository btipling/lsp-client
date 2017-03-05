import { exec } from 'child_process';
import { ChildProcess } from 'child_process';
import xs, { Listener, Stream } from 'xstream';

export enum RunEventType {
  Action = 1,
  Initialize,
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

export function errMessage(message: string) {
  return { type: RunMessageType.STD_ERR, message };
}
export function outMessage(message: string) {
  return { type: RunMessageType.STD_OUT, message };
}
export function connectMessage() {
  return { type: RunMessageType.CONNECTED, message: '' };
}
export function disconnectedMessage() {
  return { type: RunMessageType.DISCONNECTED, message: '' };
}

export function makeRunDriver(): RunDriver {

  // tslint:disable-next-line:interface-over-type-literal
  type State = { listener: Listener<RunMessage>, connection: ChildProcess };
  const state: State = {
    connection: null,
    listener: null,
  };

  const connectTo = (payload: string) => {
    if (state.connection && state.connection.disconnect) {
      state.connection.disconnect();
    }
    state.connection = exec(payload, (err: Error) => {
      state.listener.next(disconnectedMessage());
      if (err) {
        // tslint:disable-next-line:no-console
        console.log('Run exec received an error', err);
        state.connection = null;
      }
      console.log('connected');
    });
    state.listener.next(connectMessage());

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
    const con: ChildProcess = state.connection;
    con.stdin.write(payload);
  };

  const connection = xs.create<RunMessage>({
    start: (listener: Listener<RunMessage>) => {
      state.listener = listener;
    },
    stop: () => {},
  });

  function runDriver(outgoing$: Stream<RunEvent>): Stream<RunMessage> {
    outgoing$.addListener({
      next: ({ type, payload }) => {
        if (!payload) {
          return;
        }
        switch (type) {
          case RunEventType.Action:
            writeToConnection(payload);
            break;
          case RunEventType.Initialize:
            connectTo(payload);
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
