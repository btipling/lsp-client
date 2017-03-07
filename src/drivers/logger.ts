import { Stream } from 'xstream';
export type Logger = (messages$: Stream<LoggerMessage>) => void;
// tslint:disable-next-line:interface-over-type-literal
export type LoggerMessage = { messages: string[], level: number };

export function info(msgs$: Stream<string[]>): Stream<LoggerMessage> {
  return msgs$.map((messages) => ({ messages, level: levelToNumber('info') }));
}

function levelToNumber(level?: string): number {
  return ((n: number) => n >= 0 ? n : 0)([
    'error',
    'warning',
    'info',
    'debug',
  ].indexOf(level));
}

export default function logger(level: string): Logger {
  const levelIndex = levelToNumber(level);
  return (messages$: Stream<LoggerMessage>) => {
    messages$.addListener({
      next: (messages: LoggerMessage) => {
        if (messages.level > levelIndex) {
          return;
        }
        // tslint:disable-next-line:no-console
        console.log.apply(null, messages.messages);
      },
      error: () => {},
      complete: () => {},
    });
  };
}
