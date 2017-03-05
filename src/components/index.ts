import { div, makeDOMDriver, VNode } from '@cycle/dom';
import { run } from '@cycle/xstream-run';
import xs, { Stream } from 'xstream';
import logger from '../drivers/logger';
import { preventDefault } from '../drivers/prevent-default';
import { makeRunDriver, RunEventType } from '../drivers/run';
import { stickyScroll } from '../drivers/sticky-scroll';
import { ISinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';
import Connect from './connect';
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

function main(sources: ISources): ISinks {
  const connect = Connect(sources);

  const runEvent = connect.connect.map(({ value }) => {
    return { payload: value, type: RunEventType.Initialize };
  });

  const info = Info(sources);
  const responses = Response(sources);

  return {
    DOM: view(connect.DOM, info.DOM, responses.DOM),
    RUN: runEvent,
    preventDefault: connect.connect.map(({ submitEvent }) => submitEvent),
    STICKY_SCROLL: info.STICKY_SCROLL,
  };
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  LOGGER: logger('debug'),
  RUN: makeRunDriver(),
  STICKY_SCROLL: stickyScroll,
  preventDefault,
};

run(main, drivers);
