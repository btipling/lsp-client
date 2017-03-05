import { button, DOMSource, form, input, VNode } from '@cycle/dom';
import { always, compose, contains, equals, flip, ifElse, or, prop, values } from 'ramda';
import { Stream } from 'xstream';
import { RunEvent, RunMessage, RunMessageType } from '../drivers/run';
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

function view(connect$: Stream<RunEvent>): Stream<VNode> {
  // Creates connection input form.

  const { CONNECTED, DISCONNECTED } = RunMessageType;
  const isConnectionMessage = compose(flip(contains)([ CONNECTED, DISCONNECTED ]), prop('type'));
  const isConnected = compose(equals(CONNECTED), prop('type'));
  const displayConnectionMessage = ifElse(isConnected, always('🔵'), always('⚪'));

  return connect$
    .filter(isConnectionMessage)
    .map(displayConnectionMessage)
    .startWith('⚪')
    .map((connectionState) =>
    form('.Connect .connect-form', [
      'Connect path: ',
      input('.Connect-connect-path .connect-path'),
      button('.Connect-connect-submit .connect-submit', 'connect'),
      ` ${connectionState}`,
    ]),
  );
}

export default function Connect(sources): IConnectSinks {
  const connect$ = intent(sources.DOM).remember();
  const vtree$ = view(sources.RUN);
  return {
    DOM: vtree$,
    connect: connect$,
  };
}
