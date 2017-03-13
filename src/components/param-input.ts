import { div } from '@cycle/dom';
import { IDOMOnlySinks } from '../interfaces/sinks';
import { IParamInputSources } from '../interfaces/sources';

export default function ParamInput(sources: IParamInputSources): IDOMOnlySinks  {
  const html = sources.messages
      .map((f) => f())
      .map(JSON.stringify)
      .map((s: string) => div('.h-50 .w-100 .pa2 .mb2 .ParamInput', `param inputs: ${s}`));

  return {
    DOM: html,
  };
}
