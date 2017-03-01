import { VNode } from '@cycle/dom';
import { Stream } from 'xstream';
import { RunEvent } from '../drivers/run';

export interface ISinks {
  DOM: Stream<VNode>;
  RUN: Stream<RunEvent>;
}

export interface IConnectSinks {
  DOM: Stream<VNode>;
  value: Stream<any>;
}
