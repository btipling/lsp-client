import xs, { Stream } from 'xstream';

export enum EventType {
  Action = 1,
  Initialize,
}
export type Event = { type: EventType, payload: string };

export function makeRunDriver(): (outgoing$: Stream<Event>) => Stream<string> {

  function runDriver(outgoing$: Stream<Event>): Stream<string> {
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
