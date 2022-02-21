import StartStateMachineRequest from './StartStateMachineRequest'

interface StateMachineClient {
  /**
   * Start a state machine execution.
   * @param { TOptions } [options] - options to fulfill the state machine request
   * @param { TInput } -
   * @template TOptions, TInput
   */
  startStateMachine<
    TRequest extends StartStateMachineRequest<TInput>,
    TInput = unknown,
    >(
    request?: TRequest,
  ): Promise<void>
}

export default StateMachineClient
