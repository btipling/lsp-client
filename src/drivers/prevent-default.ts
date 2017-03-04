import xs, { Stream } from 'xstream';

export function preventDefault(prevented$: Stream<Event>) {
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
