import { VNode } from '@cycle/dom';
import { Stream } from 'xstream';

export interface ISinks {
  DOM: Stream<VNode>;
}
