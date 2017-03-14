import { button, div, DOMSource, form, input, label, textarea, VNode } from '@cycle/dom';
import xs, { Stream } from 'xstream';
import { IDOMOnlySinks } from '../interfaces/sinks';
import { IParamInputSources } from '../interfaces/sources';
import { RequestMessage } from '../protocol/types';
import { getValueFromFormDOMSourceStream } from './utils';

export type RequestMessageStream = { requestMessage: RequestMessage|null, event: Event|null };

function intent(domSource: DOMSource): Stream<RequestMessageStream> {
  // Captures params, methodName and an event to preventDefault on.
  const submit$ = domSource.select('.ParamInput').events('submit');
  const methodName$ = getValueFromFormDOMSourceStream(domSource.select('.ParamInput-methodName'));
  const params$ = getValueFromFormDOMSourceStream(domSource.select('.ParamInput-params'));

  // TODO: validate the JSON of the value and show info to user.
  const combineValueAndSubmitEvent = (event: Event) => xs.combine(methodName$, params$)
      .map(([ methodName, params ]: [string, string]) => ({
        event,
        requestMessage: { methodName, params: JSON.parse(params) },
      }));

  return submit$
    .map(combineValueAndSubmitEvent)
    .flatten();
}

function view(messages$: Stream<RequestMessage>): Stream<VNode> {
  return messages$
    .map((msg: RequestMessage) => ({ name: msg.methodName, params: JSON.stringify(msg.params) }))
    .map((s: { name: string, params: string }) => form('.ParamInput .h-50 .w-100 .mb2', [
      div('.h-25 .pa2', [
        label([
          div('method name:'),
          input('.ParamInput-methodName', { attrs: {
            type: 'text',
            value: s.name,
          }}),
        ]),
        button('send'),
        div('params:'),
      ]),
      textarea('.ParamInput-params .pa2 .ba .h-75 w-100', `${s.params}`),
    ]));
}

export default function ParamInput(sources: IParamInputSources): IDOMOnlySinks  {
  const actions = intent(sources.DOM);
  const html = view(sources.messages);
  return {
    DOM: html,
  };
}
