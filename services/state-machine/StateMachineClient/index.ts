import StartStateMachineRequest from './StartStateMachineRequest'

interface StateMachineClient {
  /**
   * Start a state machine execution.
   * @param { TRequest } [request] - the state machine execution request.
   * @param { TInput } [request.input] - the optional input to pass to the starting state.
   * @template TInput, TRequest
   */
  startStateMachine<
    TRequest extends StartStateMachineRequest<TInput>,
    TInput = unknown,
    >(
    request?: TRequest,
  ): Promise<void>
}

export default StateMachineClient
