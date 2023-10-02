import DeleteRequest from './DeleteRequest'
import PutRequest from './PutRequest'

interface WriteRequest {
  /**
   * A request to perform a PutItem operation.
   */
  PutRequest?: PutRequest
  /**
   * A request to perform a DeleteItem operation.
   */
  DeleteRequest?: DeleteRequest
}

export default WriteRequest
