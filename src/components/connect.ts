import { button, div, DOMSource, form, input, VNode } from '@cycle/dom';
import xs, { Stream } from 'xstream';
import { IConnectSinks } from '../interfaces/sinks';

export type ConnectStream = { value: string, submitEvent: Event };

function intent(DOM: DOMSource): Stream<ConnectStream> {

  const input$ = DOM.select('.connect-path').events('keyup')
  .map((ev) => {
    return ((ev as Event).target as HTMLInputElement).value;
  });

  const submitted$ = DOM.select('.connect-form').events('submit');

  return input$
    .map((value) => submitted$.map((submitEvent) => ({ value, submitEvent }))).flatten()
  .startWith({ value: '', submitEvent: null });
}

function view(connect$: Stream<ConnectStream>): Stream<VNode> {
  return connect$.map(({ value }) =>
    form('.connect-form', [
      'Connect path',
      input('.connect-path'),
      button('.connect-submit', 'connect'),
      div(`value: '${value}'`),
    ]),
  );
}

export default function Connect(sources): IConnectSinks {
  const connect$ = intent(sources.DOM).remember();
  const vtree$ = view(connect$);
  return {
    DOM: vtree$,
    connect: connect$,
  };
}
