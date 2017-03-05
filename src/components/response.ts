import { div, VNode} from '@cycle/dom';
import { Stream } from 'xstream';
import {RunMessage, RunMessageType} from '../drivers/run';
import { IInfoSinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';
import { runMessageToLines } from './model';

const linesToDiv = (line) => div('.flex-auto .ba .bw2', line);
const view = (lines$: Stream<string>): Stream<VNode> => lines$.map(linesToDiv);

export default function Response(sources: ISources): IInfoSinks {

  const errorsOnly = (message: RunMessage) => message.type === RunMessageType.STD_OUT;
  const lines$ = runMessageToLines(sources.RUN, errorsOnly);

  return {
    DOM: view(lines$),
  };
}
