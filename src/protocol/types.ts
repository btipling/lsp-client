import { exit } from './exit';
import { initialize } from './initialize';

export type RequestMessage = {
  methodName: string,
  params: object,
};

export const RequestMessageTypes = {
  initialize,
  exit,
};
