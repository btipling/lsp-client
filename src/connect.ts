import {div, input, VNode, DOMSource} from '@cycle/dom';
import { ISinks } from './interfaces/sinks';
import { Stream } from 'xstream';


function intent (DOM: DOMSource): Stream<string> {
  return DOM.select('.path').events('keyup')
    .map(ev => {
      return (<HTMLInputElement> ev.target).value;
    })
    .startWith('Nothing')
    .debug(msg => console.log(`msg ${msg}`));
}

function view (value$: Stream<string>): Stream<VNode> {
  return value$.map(value =>
    div([
      'Connect UI',
      input('.path'),
      div(`value: '${value}'`),
    ]),
  );
}

export default function Connect (sources): ISinks {
  const change$ = intent(sources.DOM);
  const vtree$ = view(change$);
  return {
    DOM: vtree$,
  };
}
