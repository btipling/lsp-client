import { li, ul } from '@cycle/dom';
import { keys, map } from 'ramda';
import xs from 'xstream';
import { IDOMOnlySinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';
import { RequestMessageTypes } from '../protocol/request-messages/types';

export default function MessageSelector(sources: ISources): IDOMOnlySinks  {

  const toListItem = (type: string) => li(type);
  const arrayToList = map(toListItem);
  const requestMessageTypeNames = keys(RequestMessageTypes);
  const requestMessageList = arrayToList(requestMessageTypeNames);

  const html = xs.of(ul('.h-50 .w-100 .pa2. .mt2 .mb2 .MessageSelector', 'message selector', requestMessageList));

  return {
    DOM: html,
  };
}
