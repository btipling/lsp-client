import {h2, pre, VNode} from '@cycle/dom';
import xs from 'xstream';
import { Stream } from 'xstream';
import { IInfoSinks } from '../interfaces/sinks';
import {ISources} from '../interfaces/sources';

function view(run$: Stream<string>): Stream<VNode> {
  return run$
    .startWith('lolz')
    .map((value) =>
    pre(value),
  );
  // return xs.of(h2('lol'));
}

export default function Info(sources: ISources): IInfoSinks {
  const vtree$ = view(sources.RUN);
  return {
    DOM: vtree$,
  };
}
