import { div, makeDOMDriver, VNode } from '@cycle/dom';
import storageDriver from '@cycle/storage';
import { run } from '@cycle/xstream-run';
import { append, both, compose, equals, flip, is, length, lt, merge, prop, zipObj } from 'ramda';
import xs, { Stream } from 'xstream';
import logger from '../drivers/logger';
import { preventDefault } from '../drivers/prevent-default';
import { makeRunDriver, RunEventType } from '../drivers/run';
import { stickyScroll } from '../drivers/sticky-scroll';
import { ISinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';
import Connect, { ConnectStream } from './connect';
import Info from './info';
import MessageSelectors from './message-selector';
import ParamInput from './param-input';
import Response from './response';

function view(
    connect$: Stream<VNode>,
    info$: Stream<VNode>,
    response$: Stream<VNode>,
    message$: Stream<VNode>,
    params$: Stream<VNode>,
  ): Stream<VNode> {
  return xs.combine(
    connect$,
    info$,
    response$,
    message$,
    params$,
  )
    .map(([
      connectVTree,
      infoVTree,
      responseVTree,
      messageSelVTree,
      paramVTree,
    ]) =>
      div('.h-100', [
        div('.fl .h-100 .w-50 .pa2', [
          connectVTree,
          responseVTree,
          infoVTree,
        ]),
        div('.fl .h-100 .w-50 .pa2', [
          paramVTree,
          messageSelVTree,
        ]),
      ]),
    );
}

function connectStorageModel(connect$: Stream<ConnectStream>): Stream<{[index: string]: string; }> {
  // Filter to get connection ConnectStream events.
  const getType: (c: ConnectStream) => RunEventType = prop('type');
  const isConnection = equals(RunEventType.Connect);
  const getConnections = compose(isConnection, getType);

  // Filter out undefined or invalid values
  const getConnectionValueString = prop('value');
  const isString = is(String);
  const minLength = lt(5);
  const isMinLength = compose(minLength, length);
  const isValid = compose(both(isMinLength, isString), getConnectionValueString);

  // Maps connection ConnectStream events to storageDriver { target: 'local', key: 'connectionString', value }.
  const toStoreObj: (a: string[]) => { [name: string]: string } = zipObj([ 'target', 'key', 'value' ]);
  const storeValues = flip(append)([ 'local', 'connectionString' ]);
  const mapToStore = compose(toStoreObj, storeValues, getConnectionValueString);

  // Apply previous connect events filter and storage map to ConnectStream events.
  return connect$
    .filter(getConnections)
    .filter(isValid)
    .map(mapToStore);
}

function main(sources: ISources): ISinks {
  const addToSources = merge(sources);

  const connect = Connect(sources);
  const info = Info(sources);
  const responses = Response(sources);
  const messageSelectors = MessageSelectors(sources);

  const { messages } = messageSelectors;
  const paramInput = ParamInput(addToSources({ messages }));

  const runEvent = connect.connect.map(({ value, type }) => ({ payload: value, type }));
  const getEvent: (c: ConnectStream) => Event = prop('event');
  const connectStorage$ = connectStorageModel(connect.connect);

  const view$ = view(
    connect.DOM,
    info.DOM,
    responses.DOM,
    messageSelectors.DOM,
    paramInput.DOM,
  );

  return {
    DOM: view$,
    RUN: runEvent,
    preventDefault: connect.connect.map(getEvent),
    STICKY_SCROLL: info.STICKY_SCROLL,
    storage: connectStorage$,
  };
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  LOGGER: logger('debug'),
  RUN: makeRunDriver(),
  STICKY_SCROLL: stickyScroll,
  preventDefault,
  storage: storageDriver,
};

run(main, drivers);
