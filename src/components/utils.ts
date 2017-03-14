import { DOMSource } from '@cycle/dom';
import { compose, head, prop } from 'ramda';
import { Stream } from 'xstream';

export function getValueFromFormDOMSourceStream(domSource: DOMSource): Stream<string> {
  // Returns a function that gets the first element from a stream and returns its value.

  const getFirst: (els: HTMLInputElement[]) => Element = head;
  const getValue: (e: Element) => string = prop('value');

  const getValueFromFormItemStream = compose(getValue, getFirst);

  return domSource.elements()
    .take(1)
    .map(getValueFromFormItemStream);
}
