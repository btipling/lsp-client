import { DOMSource, li, ul, VNode } from '@cycle/dom';
import { flip, keys, map, prop } from 'ramda';
import xs, { Stream } from 'xstream';
import { IMessageSelectSinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';
import { RequestMessageTypes } from '../protocol/request-messages/types';

function intent(domSource: DOMSource): Stream<string> {
  return domSource.select('.MessageSelector-item').events('click')
    .map((e) => {
      const el = e.srcElement;
      console.log('el', el);
      if (!el) {
        return '';
      }
      return el.getAttribute('data-type') || '';
    })
    .debug((e) => console.log('clicked', e));
}

function model(actions$: Stream<string>): Stream<() => object> {
  const getRequestMessageFunction: (name: string) => (() => object) = flip(prop)(RequestMessageTypes);

  return actions$
    .map(getRequestMessageFunction)
    .startWith(RequestMessageTypes.initialize);
}

function view(): Stream<VNode> {
  const toListItem = (type: string) => li('.MessageSelector-item', { attrs: { 'data-type': type } }, type);
  const arrayToList = map(toListItem);
  const requestMessageTypeNames = keys(RequestMessageTypes);
  const requestMessageList = arrayToList(requestMessageTypeNames);

  return xs.of(ul('.h-50 .w-100 .pa2. .mt2 .mb2 .MessageSelector', 'message selector', requestMessageList));
}

export default function MessageSelector(sources: ISources): IMessageSelectSinks  {
  const actions$ = intent(sources.DOM);

  // TODO: remove this once we do something useful with click.
  actions$.addListener({ next: (e) => console.log('actions', e) });
  const messages$ = model(actions$);

  const html$ = view();
  return {
    messages: messages$,
    DOM: html$,
  };
}
