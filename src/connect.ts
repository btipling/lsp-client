import { div } from '@cycle/dom';
import { ISinks } from './interfaces/sinks';
import xs  from 'xstream';

export default function Connect (sources): ISinks {
  return {
    DOM: xs.of(
      div('Connect UI'),
    ),
  };
}
