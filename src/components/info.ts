import { pre, VNode} from '@cycle/dom';
import xs, { Stream } from 'xstream';
import {RunMessage, RunMessageType} from '../drivers/run';
import { IInfoSinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';
import { runMessageToLines } from './model';

export default function Info(sources: ISources): IInfoSinks {
  const linesToPre = (line) => pre('.Info .ba', line);
  const view = (lines$: Stream<string>): Stream<VNode> => lines$.map(linesToPre);

  const errorsOnly = (message: RunMessage) => message.type === RunMessageType.STD_ERR;
  const lines$ = runMessageToLines(sources.RUN, errorsOnly);

  return {
    DOM: view(lines$),
    STICKY_SCROLL: lines$.map(() => sources.DOM.select('.Info')),
  };
}
