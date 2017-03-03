import { pre, VNode} from '@cycle/dom';
import { Stream } from 'xstream';
import { IInfoSinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';
import { runMessageToLines } from './model';

const view = (lines$: Stream<string>): Stream<VNode> => lines$.map(pre);

export default function Info(sources: ISources): IInfoSinks {
  const lines$ = runMessageToLines(sources.RUN);

  return {
    DOM: view(lines$),
  };
}
