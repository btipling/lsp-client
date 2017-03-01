import { DOMSource } from '@cycle/dom/xstream-typings';
import { Stream } from 'xstream';
import { Logger } from '../drivers/logger';

export interface ISources {
  DOM: DOMSource;
  LOGGER: Logger;
  RUN: Stream<string>;
}
