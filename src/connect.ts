import {div, input, VNode, DOMSource, button} from '@cycle/dom';
import { IConnectSinks } from './interfaces/sinks';
import { Stream } from 'xstream';


function intent (DOM: DOMSource): Stream<string> {

  const input$ = DOM.select('.connect-path').events('keyup')
  .map((ev) => {
    return (<HTMLInputElement> (<Event> ev).target).value;
  });

  const submitted$ = DOM.select('.connect-submit').events('click');

  return input$.map(inputVal => submitted$.map(() => inputVal)).flatten()
  .startWith('Nothing')
  .debug(msg => console.log(`msg ${msg}`));
}

function view (value$: Stream<string>): Stream<VNode> {
  return value$.map(value =>
    div([
      'Connect path',
      input('.connect-path'),
      button('.connect-submit', 'connect'),
      div(`value: '${value}'`),
    ]),
  );
}

export default function Connect (sources): IConnectSinks {
  const change$ = intent(sources.DOM);
  const vtree$ = view(change$);
  const value$ = change$.remember();
  return {
    DOM: vtree$,
    value: value$,
  };
}
