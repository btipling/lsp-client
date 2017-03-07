import { button, DOMSource, form, input, VNode } from '@cycle/dom';
import { always, compose, contains, equals, flip, ifElse, or, prop, values } from 'ramda';
import xs, { Stream } from 'xstream';
import { RunEvent, RunEventType, RunMessage, RunMessageType } from '../drivers/run';
import { IConnectSinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';

export type ConnectStream = { value: string, event: Event, type: RunEventType };

function intent(DOM: DOMSource, storage$: Stream<string>): Stream<ConnectStream> {
  // Gets input value and submit event from DOM.
  const { Connect, Disconnect } = RunEventType;

  const input$ = DOM.select('.connect-path').events('keyup');
  const submit$ = DOM.select('.connect-form').events('submit');
  const disconnectButtonClick$ = DOM.select('.connect-disconnect').events('click');

  const eventToValue = (ev) => ((ev as Event).target as HTMLInputElement).value;
  const combineValueAndSubmitEvent = (value) => submit$.map((submitEvent) => ({ value, event, type: Connect }));

  const connect$ = input$
    .map(eventToValue)
    .map(combineValueAndSubmitEvent)
    .flatten();

  const disconnect$ = disconnectButtonClick$
    .map((event) => ({ value: '', event, type: Disconnect }));

  return xs.merge<ConnectStream>(connect$, disconnect$)
    .startWith({ value: '', event: null, type: RunEventType.Noop });
}

function view(connect$: Stream<RunMessage>): Stream<VNode> {
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
      button('.Connect-disconnect .connect-disconnect', 'disconnect'),
      ` ${connectionState}`,
    ]),
  );
}

export default function Connect(sources: ISources): IConnectSinks {
  const connect$ = intent(sources.DOM, sources.storage).remember();
  const vtree$ = view(sources.RUN);
  return {
    DOM: vtree$,
    connect: connect$,
  };
}
