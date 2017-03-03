import { pre, VNode} from '@cycle/dom';
import { compose, concat, join, split, takeLast } from 'ramda';
import { Stream } from 'xstream';
import { errMessage, RunMessage, RunMessageType } from '../drivers/run';
import { IInfoSinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';

function view(run$: Stream<RunMessage>): Stream<VNode> {
  // Take stderr stream chunks and show last 100 lines of log messages in a <pre>.
  const errorsOnly = (message: RunMessage) => message.type === RunMessageType.STD_ERR;

  const splitter = '\n';
  const messageOnly = (message: RunMessage) => message.message;
  const lineSplitter = split(splitter);
  const formatMessage = compose(lineSplitter, messageOnly);

  const maxLines = takeLast(100);
  const messagesToDisplay = compose(maxLines, concat);

  const combineLines = join(splitter);
  const html = compose(pre, combineLines);

  return run$
    .startWith(errMessage('Log messages will appear here.'))
    .filter(errorsOnly)
    .map(formatMessage)
    .fold(messagesToDisplay, [])
    .map(html);
}

export default function Info(sources: ISources): IInfoSinks {
  return {
    DOM: view(sources.RUN),
  };
}
