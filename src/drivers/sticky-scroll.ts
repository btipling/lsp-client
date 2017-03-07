import { DOMSource } from '@cycle/dom';
import xs, { Stream } from 'xstream';

export function stickyScroll(incoming$: Stream<DOMSource>): Stream<any> {
  // Scrolls element with new events to the bottom.

  const domSourceToElements = (domSource) => domSource.elements();
  const elementsToOneEventPerElement = (elements) => xs.fromArray(elements);

  const scrollToBottom = (el) => el.scrollTop = el.scrollHeight;
  const noop = () => {};

  incoming$
    .map(domSourceToElements).flatten()
    .map(elementsToOneEventPerElement).flatten()
    .addListener({ next: scrollToBottom, error: noop, complete: noop });

  return xs.empty();
}
