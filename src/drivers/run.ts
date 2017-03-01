import { exec } from 'child_process';
import {ChildProcess} from 'child_process';
import xs, {Listener, Stream} from 'xstream';

export enum RunEventType {
  Action = 1,
  Initialize,
}
// tslint:disable-next-line:interface-over-type-literal
export type RunEvent = { type: RunEventType, payload: string };
// tslint:disable-next-line:interface-over-type-literal
export type RunDriver = (outgoing$: Stream<RunEvent>) => Stream<string>;

export function makeRunDriver(): RunDriver {

  // tslint:disable-next-line:interface-over-type-literal
  type State = { listener: Listener<string>, connection: ChildProcess };
  const state: State = {
    connection: null,
    listener: null,
  };

  const connectTo = (payload: string) => {
    if (state.connection && state.connection.disconnect) {
      state.connection.disconnect();
    }
    state.connection = exec(payload, (err: Error) => {
      if (err) {
        // tslint:disable-next-line:no-console
        console.log('Run exec received an error', err);
        state.connection = null;
      }
    });
    state.connection.stdout.on('data', (chunk: string) => {
      if (!state.listener) {
        return;
      }
      state.listener.next(chunk);
    });
    state.connection.stderr.on('data', (chunk: string) => {
      if (!state.listener) {
        return;
      }
      state.listener.next(chunk);
    });
  };

  const writeToConnection = (payload: string) => {
    if (!state.connection) {
      return;
    }
    const con: ChildProcess = state.connection;
    con.stdin.write(payload);
  };

  const connection = xs.create<string>({
    start: (listener: Listener<string>) => {
      state.listener = listener;
    },
    stop: () => {},
  });

  function runDriver(outgoing$: Stream<RunEvent>): Stream<string> {
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
