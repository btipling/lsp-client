import { VNode } from '@cycle/dom';
import { Stream } from 'xstream';
import { ConnectStream } from '../components/connect';
import { RunEvent } from '../drivers/run';

export interface ISinks {
  DOM: Stream<VNode>;
  RUN: Stream<RunEvent>;
  preventDefault: Stream<Event>;
}

export interface IConnectSinks {
  DOM: Stream<VNode>;
  connect: Stream<ConnectStream>;
}

export interface IInfoSinks {
  DOM: Stream<VNode>;
}
