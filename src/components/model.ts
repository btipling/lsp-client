import { compose, concat, join, split, takeLast } from 'ramda';
import { Stream } from 'xstream';
import { errMessage, RunMessage, RunMessageType } from '../drivers/run';

export function runMessageToLines(messages$: Stream<RunMessage>): Stream<string> {
  // Take stderr stream chunks and show last 100 lines of log messages in a <pre>.
  const errorsOnly = (message: RunMessage) => message.type === RunMessageType.STD_ERR;

  const splitter = '\n';
  const messageOnly = (message: RunMessage) => message.message;
  const lineSplitter = split(splitter);
  const formatMessage = compose(lineSplitter, messageOnly);

  const maxLines: (messages: string[]) => string[] = takeLast(100);
  const messagesToDisplay = compose(maxLines, concat as (a: string[], b: string[]) => string[]);

  const combineLines = join(splitter);
  return messages$
    .startWith(errMessage('Log messages will appear here.'))
    .filter(errorsOnly)
    .map(formatMessage)
    .fold(messagesToDisplay, [])
    .map(combineLines);
}
