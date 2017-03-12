import { DOMSource } from '@cycle/dom';
import { Stream } from 'xstream';
import { Logger } from '../drivers/logger';
import { RunMessage } from '../drivers/run';

export interface ISources {
  DOM: DOMSource;
  LOGGER: Logger;
  RUN: Stream<RunMessage>;
  storage: Stream<string>;
}
