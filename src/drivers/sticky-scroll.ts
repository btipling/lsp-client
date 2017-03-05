import { DOMSource } from '@cycle/dom';
import xs, { Stream } from 'xstream';

export function stickyScroll(incoming$: Stream<DOMSource>) {
  incoming$.addListener({
    next: (domSource) => {
      console.log('ds', domSource);
      if (!domSource) {
        return;
      }
      console.log(domSource);
    },
    error: () => {},
    complete: () => {},
  });
  return xs.empty();
}
