import { h1, div, makeDOMDriver, VNode } from '@cycle/dom';
import { run } from '@cycle/xstream-run';
import xs, { Stream } from 'xstream';
import logger from './logger';
import { ISinks } from './interfaces/sinks';
import { ISources } from './interfaces/sources';
import Connect from './connect';
import { makeRunDriver } from './run';


function view(connectDOM: Stream<VNode>): Stream<VNode> {
  const interval$ =  xs.periodic(1000);
  return xs.combine(connectDOM, interval$)
  .map(([connectVTree, i]) =>
    div([
      h1(`${i} seconds elapsed`),
      connectVTree,
    ])
  )
}

function main(sources: ISources): ISinks {

  let connect = Connect(sources);

  return {
    RUN: connect.value,
    DOM: view(connect.DOM),
  };
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  LOGGER: logger('debug'),
  RUN: makeRunDriver(),
};

run(main, drivers);
