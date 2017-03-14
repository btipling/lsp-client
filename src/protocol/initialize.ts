import { RequestMessage } from './types';

export function initialize(): RequestMessage {
  return {
    methodName: 'initialize',
    params: {
      initialize: 'initalizedata',
    },
  };
}
