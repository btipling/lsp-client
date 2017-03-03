import { pre, VNode} from '@cycle/dom';
import { Stream } from 'xstream';
import {RunMessage, RunMessageType} from '../drivers/run';
import { IInfoSinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';
import { runMessageToLines } from './model';

const view = (lines$: Stream<string>): Stream<VNode> => lines$.map(pre);

export default function Info(sources: ISources): IInfoSinks {

  const errorsOnly = (message: RunMessage) => message.type === RunMessageType.STD_ERR;
  const lines$ = runMessageToLines(sources.RUN, errorsOnly);

  return {
    DOM: view(lines$),
  };
}
