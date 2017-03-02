import { pre, VNode} from '@cycle/dom';
import { compose, concat, join, split, takeLast } from 'ramda';
import { Stream } from 'xstream';
import { IInfoSinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';

function view(run$: Stream<string>): Stream<VNode> {
  // Take stderr stream chunks and show last 100 lines of log messages in a <pre>.
  const splitter = '\n';

  const lineSplitter = split(splitter);
  const maxLines = takeLast(100);
  const messagesToDisplay = compose(maxLines, concat);

  const combineLines = join(splitter);
  const html = compose(pre, combineLines);

  return run$
    .startWith('Log messages will appear here.')
    .map(lineSplitter)
    .fold(messagesToDisplay, [])
    .map(html);
}

export default function Info(sources: ISources): IInfoSinks {
  return {
    DOM: view(sources.RUN),
  };
}
