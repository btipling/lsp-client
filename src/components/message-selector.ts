import { div } from '@cycle/dom';
import xs from 'xstream';
import { IDOMOnlySinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';

export default function MessageSelector(sources: ISources): IDOMOnlySinks  {
  return {
    DOM: xs.of(div('.h-50 .w-100 .pa2. .mt2 .mb2 .MessageSelector', 'message selector')),
  };
}
