import { h1, makeDOMDriver, VNode } from '@cycle/dom';
import { DOMSource } from '@cycle/dom/xstream-typings';
import { run } from '@cycle/xstream-run';
import xs, { Stream } from 'xstream';
import logger, { Logger } from './logger';

export interface ISources {
  DOM: DOMSource;
  LOGGER: Logger;
}
export interface ISinks {
  DOM: Stream<VNode>;
}

function main(sources: ISources): ISinks {
  return {
    DOM: xs.periodic(1000).map((i) =>
      h1(`${i} seconds elapsed`),
    ),
  };
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  LOGGER: logger('debug'),
};

run(main, drivers);
