import { DOMSource, VNode } from '@cycle/dom';
import { Stream } from 'xstream';
import { ConnectStream } from '../components/connect';
import { RunEvent } from '../drivers/run';
import { RequestMessage } from '../protocol/types';

export interface ISinks {
  DOM: Stream<VNode>;
  RUN: Stream<RunEvent>;
  preventDefault: Stream<Event>;
  STICKY_SCROLL: Stream<DOMSource>;
  storage: Stream<{[index: string]: string; }>;
}

export interface IConnectSinks {
  DOM: Stream<VNode>;
  connect: Stream<ConnectStream>;
}

export interface IInfoSinks {
  DOM: Stream<VNode>;
  STICKY_SCROLL: Stream<DOMSource>;
}

export interface IDOMOnlySinks {
  DOM: Stream<VNode>;
}

export interface IMessageSelectSinks {
  messages: Stream<RequestMessage>;
  DOM: Stream<VNode>;
}
