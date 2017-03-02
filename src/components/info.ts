import { pre, VNode} from '@cycle/dom';
import { compose, concat, split, subtract, takeLast } from 'ramda';
import { Stream } from 'xstream';
import { IInfoSinks } from '../interfaces/sinks';
import { ISources } from '../interfaces/sources';

function view(run$: Stream<string>): Stream<VNode> {
  const lineSplitter = split('\n');
  const maxLines = takeLast(100);
  const messagesToDisplay = compose(maxLines, concat);

  return run$
    .startWith('Log messages will appear here.')
    .map(lineSplitter)
    .fold(messagesToDisplay, [])
    .map((value) => pre(value.join('\n')),
  );
}

export default function Info(sources: ISources): IInfoSinks {
  return {
    DOM: view(sources.RUN),
  };
}
