export type MessageExtractor<TMessage, TBody> = (
  message: TMessage,
  parseJSON: boolean,
) => TBody

export interface DynamoStreamRecord<TInner = unknown> {
  type: 'INSERT' | 'MODIFY' | 'REMOVE'
  data: TInner
}
