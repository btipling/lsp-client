import { div } from '@cycle/dom';
import xs from 'xstream';
import { IDOMOnlySinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';

export default function ParamInput(sources: ISources): IDOMOnlySinks  {
  return {
    DOM: xs.of(div('.h-50 .w-100 .pa2 .mb2 .ParamInput', 'param inputs')),
  };
}
