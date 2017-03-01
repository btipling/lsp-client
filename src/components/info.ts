import {h2, pre, VNode} from '@cycle/dom';
import { Stream } from 'xstream';
import { IInfoSinks } from '../interfaces/sinks';
import {ISources} from '../interfaces/sources';

function view(run$: Stream<string>): Stream<VNode> {
  return run$
    .startWith('Input will appear here.')
    .map((value) =>
    pre(value),
  );
}

export default function Info(sources: ISources): IInfoSinks {
  const vtree$ = view(sources.RUN);
  return {
    DOM: vtree$,
  };
}
