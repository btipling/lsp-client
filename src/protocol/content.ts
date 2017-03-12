
export default function contentWrapper(method: string, params: any): any {
  let id = 0;
  const nextId = () => {
    id += 1;
    return id;
  };
  return () => ({ jsonrpc: '2.0', id: nextId(), method, params });
}
