import { div, makeDOMDriver, VNode } from '@cycle/dom';
import storageDriver from '@cycle/storage';
import { run } from '@cycle/xstream-run';
import { append, both, compose, equals, flip, is, length, lt, prop, zipObj } from 'ramda';
import xs, { Stream } from 'xstream';
import logger from '../drivers/logger';
import { preventDefault } from '../drivers/prevent-default';
import { makeRunDriver, RunEventType } from '../drivers/run';
import { stickyScroll } from '../drivers/sticky-scroll';
import { ISinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';
import Connect, { ConnectStream } from './connect';
import Info from './info';
import Response from './response';

function view(connectDOM$: Stream<VNode>, info$: Stream<VNode>, response$: Stream<VNode>): Stream<VNode> {
  return xs.combine(connectDOM$, info$, response$)
  .map(([ connectVTree, infoVTree, responseVTree ]) =>
    div('.h-100', [
      connectVTree,
      div('.h-100', [
        responseVTree,
        infoVTree,
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
  const connect = Connect(sources);

  const runEvent = connect.connect.map(({ value, type }) => {
    console.log('got value', value, type);
    return { payload: value, type };
  });

  const info = Info(sources);
  const responses = Response(sources);
  const getEvent: (c: ConnectStream) => Event = prop('event');

  const connectStorage$ = connectStorageModel(connect.connect);

  return {
    DOM: view(connect.DOM, info.DOM, responses.DOM),
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
