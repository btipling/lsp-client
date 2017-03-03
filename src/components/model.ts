import { compose, concat, join, split, takeLast } from 'ramda';
import { Stream } from 'xstream';
import { errMessage, RunMessage } from '../drivers/run';

type MessageFilter = (m: RunMessage) => boolean;

export function runMessageToLines(messages$: Stream<RunMessage>, messageFilter: MessageFilter): Stream<string> {
  // Take a run message stream chunks and show last 100 lines of log messages in a <pre>.

  const splitter = '\n';
  const messageOnly = (message: RunMessage) => message.message;
  const lineSplitter = split(splitter);
  const formatMessage = compose(lineSplitter, messageOnly);

  const maxLines: (messages: string[]) => string[] = takeLast(100);
  const messagesToDisplay = compose(maxLines, concat as (a: string[], b: string[]) => string[]);

  const combineLines = join(splitter);
  return messages$
    .startWith(errMessage('Log messages will appear here.'))
    .filter(messageFilter)
    .map(formatMessage)
    .fold(messagesToDisplay, [])
    .map(combineLines);
}
