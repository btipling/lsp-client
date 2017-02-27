import xs, { Stream } from 'xstream';

export enum RunEventType {
  Action = 1,
  Initialize,
}
export type RunEvent = { type: RunEventType, payload: string };

export function makeRunDriver(): (outgoing$: Stream<RunEvent>) => Stream<string> {

  function runDriver(outgoing$: Stream<RunEvent>): Stream<string> {
    outgoing$.addListener({
      next: outgoing => {
        console.log('connecting to', outgoing);
      },
      error: () => {},
      complete: () => {},
    });

    const connection = xs.create<string>({
      start: listener => {
        listener.next('incoming next');
      },
      stop: () => {},
    });

    return connection;
  }

  return runDriver;
}
