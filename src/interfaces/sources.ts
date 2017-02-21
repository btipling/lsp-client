import { DOMSource } from '@cycle/dom/xstream-typings';
import { Logger } from '../logger';

export interface ISources {
  DOM: DOMSource;
  LOGGER: Logger;
}
