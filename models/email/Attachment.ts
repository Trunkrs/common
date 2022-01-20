import { MimeType } from '../enum'

/**
 * Represents an email attachment. The data parameter takes an base64 encoded buffer.
 *
 * @interface
 */
interface Attachment {
  fileName: string
  data: Buffer
  mimeType: MimeType
}

export default Attachment
