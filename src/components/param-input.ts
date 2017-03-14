import { button, div, form, input, label, textarea, VNode } from '@cycle/dom';
import { Stream } from 'xstream';
import { IDOMOnlySinks } from '../interfaces/sinks';
import { IParamInputSources } from '../interfaces/sources';
import { RequestMessage } from '../protocol/types';

function view(messages$: Stream<RequestMessage>): Stream<VNode> {
  return messages$
    .map((msg: RequestMessage) => ({ name: msg.methodName, params: JSON.stringify(msg.params) }))
    .map((s: { name: string, params: string }) => form('.h-50 .w-100 .mb2 .ParamInput', [
      div('.h-25 .pa2', [
        label([
          div('method name:'),
          input({ attrs: {
            type: 'text',
            value: s.name,
          }}),
        ]),
        button('send'),
        div('params:'),
      ]),
      textarea('.pa2  .ba .h-75 w-100', `${s.params}`),
    ]));
}

export default function ParamInput(sources: IParamInputSources): IDOMOnlySinks  {
  const html = view(sources.messages);
  return {
    DOM: html,
  };
}
