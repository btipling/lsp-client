import { button, div, DOMSource, form, input, VNode } from '@cycle/dom';
import { Stream } from 'xstream';
import { IConnectSinks } from '../interfaces/sinks';

export type ConnectStream = { value: string, submitEvent: Event };

function intent(DOM: DOMSource): Stream<ConnectStream> {
  // Gets input value and submit event from DOM.

  const input$ = DOM.select('.connect-path').events('keyup');
  const submitted$ = DOM.select('.connect-form').events('submit');

  const eventToValue = (ev) => ((ev as Event).target as HTMLInputElement).value;
  const combineValueAndSubmitEvent = (value) => submitted$.map((submitEvent) => ({ value, submitEvent }));

  return input$
    .map(eventToValue)
    .map(combineValueAndSubmitEvent)
    .flatten()
    .startWith({ value: '', submitEvent: null });
}

function view(connect$: Stream<ConnectStream>): Stream<VNode> {
  // Creates connection input form.

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
