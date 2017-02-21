export type Logger = (level: number, ...msgs: any[]) => void;

export function info(logger: Logger, ...msgs: any[]) {
  logger(levelToNumber('info'), ...msgs);
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
  return (levelNumber: number, ...msgs: any[]) => {
    if (levelNumber > levelIndex) {
      return;
    }
    // tslint:disable-next-line:no-console
    console.log.apply(null, msgs);
  };
}
