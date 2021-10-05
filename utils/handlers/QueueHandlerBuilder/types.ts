export type MessageExtractor<TMessage, TBody> = (
  message: TMessage,
  parseJSON: boolean,
) => TBody
