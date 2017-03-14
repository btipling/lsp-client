import { RequestMessage } from './types';

export function exit(): RequestMessage {
  return {
    methodName: 'exit',
    params: {
      exit: 'exitCode',
    },
  };
}
