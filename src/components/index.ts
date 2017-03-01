import { div, h1, makeDOMDriver, VNode } from '@cycle/dom';
import { run } from '@cycle/xstream-run';
import xs, { Stream } from 'xstream';
import logger from '../drivers/logger';
import { makeRunDriver, RunEvent, RunEventType } from '../drivers/run';
import { ISinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';
import Connect from './connect';
import Info from './info';

function view(connectDOM$: Stream<VNode>, info$: Stream<VNode>): Stream<VNode> {
  const interval$ =  xs.periodic(1000);
  return xs.combine(connectDOM$, info$, interval$)
  .map(([connectVTree, infoVTree, i]) =>
    div([
      h1(`${i} seconds elapsed`),
      connectVTree,
      infoVTree,
    ]),
  );
}

function main(sources: ISources): ISinks {

  const connect = Connect(sources);
  // sources.RUN.addListener({
  //   next: (msg) => {
  //     // tslint:disable-next-line:no-console
  //     console.log('Received message:', msg);
  //   },
  // });

  const runEvent = connect.value.map((payload) => {
    return { payload, type: RunEventType.Initialize };
  });

  return {
    DOM: view(connect.DOM, Info(sources).DOM),
    RUN: runEvent,
  };
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  LOGGER: logger('debug'),
  RUN: makeRunDriver(),
};

run(main, drivers);
