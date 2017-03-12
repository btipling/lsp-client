import { Buffer } from 'buffer';
import { join } from 'ramda';

export default function header(content: string): string {
  const delimiter = '\n\n';
  const concat = join(delimiter);
  const numBytes = Buffer.byteLength(content);
  const contentLength = `Content-Length: ${numBytes}`;
  const contentType = `Content-Type: application/vscode-jsonrpc; charset=utf8`;

  return concat([ contentLength, contentType, delimiter, content ]);
}
