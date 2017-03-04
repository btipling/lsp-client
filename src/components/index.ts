import { div, makeDOMDriver, VNode } from '@cycle/dom';
import { run } from '@cycle/xstream-run';
import xs, { Stream } from 'xstream';
import logger from '../drivers/logger';
import { preventDefault } from '../drivers/prevent-default';
import { makeRunDriver, RunEventType } from '../drivers/run';
import { ISinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';
import Connect from './connect';
import Info from './info';
import Response from './response';

function view(connectDOM$: Stream<VNode>, info$: Stream<VNode>, response$: Stream<VNode>): Stream<VNode> {
  return xs.combine(connectDOM$, info$, response$)
  .map(([ connectVTree, infoVTree, responseVTree ]) =>
    div([
      connectVTree,
      responseVTree,
      infoVTree,
    ]),
  );
}

function main(sources: ISources): ISinks {
  const connect = Connect(sources);

  const runEvent = connect.connect.map(({ value }) => {
    return { payload: value, type: RunEventType.Initialize };
  });

  return {
    DOM: view(connect.DOM, Info(sources).DOM, Response(sources).DOM),
    RUN: runEvent,
    preventDefault: connect.connect.map(({ submitEvent }) => submitEvent),
  };
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  LOGGER: logger('debug'),
  RUN: makeRunDriver(),
  preventDefault,
};

run(main, drivers);
