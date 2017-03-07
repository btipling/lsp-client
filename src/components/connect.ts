import { button, DOMSource, form, input, VNode } from '@cycle/dom';
import { always, compose, contains, equals, flip, head, ifElse, or, prop, values } from 'ramda';
import xs, { Stream } from 'xstream';
import { RunEventType, RunMessage, RunMessageType } from '../drivers/run';
import { IConnectSinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';

export type ConnectStream = { value: string, event: Event, type: RunEventType };

function intent(DOM: DOMSource): Stream<ConnectStream> {
  // Gets input value and submit event from DOM.
  const { Connect, Disconnect } = RunEventType;

  const input$ = DOM.select('.connect-path').elements().take(1);
  const submit$ = DOM.select('.connect-form').events('submit');
  const disconnectButtonClick$ = DOM.select('.connect-disconnect').events('click');

  const getFirst: (els: HTMLInputElement[]) => Element = head;
  const getValue: (e: Element) => string = prop('value');
  const getValueFromFirstElement: (e: HTMLInputElement[]) => string = compose(getValue, getFirst);

  const combineValueAndSubmitEvent = (event) => input$
    .map(getValueFromFirstElement)
    .map((value: string) => ({ value, event, type: Connect }),
  );

  const connect$ = submit$
    .map(combineValueAndSubmitEvent)
    .flatten();

  const disconnect$ = disconnectButtonClick$
    .map((event) => ({ value: '', event, type: Disconnect }));

  return xs.merge<ConnectStream>(connect$, disconnect$)
    .startWith({ value: '', event: null, type: RunEventType.Noop });
}

function view(connect$: Stream<RunMessage>, storage: any): Stream<VNode> {
  // Creates connection input form.

  const { CONNECTED, DISCONNECTED } = RunMessageType;
  const isConnectionMessage = compose(flip(contains)([ CONNECTED, DISCONNECTED ]), prop('type'));
  const isConnected = compose(equals(CONNECTED), prop('type'));
  const displayConnectionMessage = ifElse(isConnected, always('🔵'), always('⚪'));

  const connectionState$ = connect$
    .filter(isConnectionMessage)
    .map(displayConnectionMessage)
    .startWith('⚪');

  return xs.combine(connectionState$, storage.local.getItem('connectionString'))
    .map(([ connectionState, connectionString ]) =>
    form('.Connect .connect-form', [
      'Connect path: ',
      input('.Connect-connect-path .connect-path', { attrs: { type: 'text', value: connectionString } }),
      button('.Connect-connect-submit .connect-submit', 'connect'),
      button('.Connect-disconnect .connect-disconnect', 'disconnect'),
      ` ${connectionState}`,
    ]),
  );
}

export default function Connect(sources: ISources): IConnectSinks {
  const connect$ = intent(sources.DOM).remember();
  const vtree$ = view(sources.RUN, sources.storage);
  return {
    DOM: vtree$,
    connect: connect$,
  };
}
