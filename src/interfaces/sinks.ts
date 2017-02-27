import { VNode } from '@cycle/dom';
import { Stream } from 'xstream';

export interface ISinks {
  DOM: Stream<VNode>;
  RUN: Stream<string>;
}

export interface IConnectSinks {
  DOM: Stream<VNode>;
  value: Stream<any>;
}
