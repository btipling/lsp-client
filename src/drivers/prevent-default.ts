import xs, { Stream } from 'xstream';

export function preventDefault(prevented$: Stream<Event>): Stream<any> {
  prevented$.addListener({
    next: (event) => {
      if (!event) {
        return;
      }
      event.preventDefault();
    },
    error: () => {},
    complete: () => {},
  });
  return xs.empty();
}
