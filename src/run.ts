import xs, {Stream, Listener} from 'xstream';
import { exec } from 'child_process';
import {ChildProcess} from "child_process";

export enum RunEventType {
  Action = 1,
  Initialize,
}
export type RunEvent = { type: RunEventType, payload: string };
export type RunDriver = (outgoing$: Stream<RunEvent>) => Stream<string>;

export function makeRunDriver(): RunDriver {

  type State = { listener: Listener<string>, connection: ChildProcess };
  const state: State = {
    listener: null,
    connection: null,
  };

  const connectTo = (payload: string) => {
    if (state.connection) {
      state.connection.disconnect();
    }
    state.connection = exec(payload, (err: Error) => {
      if (err) {
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
