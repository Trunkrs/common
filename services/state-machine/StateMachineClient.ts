interface StateMachineClient {
  /**
   * Start a state machine execution.
   * @param { TInput } [input] - the optional input to pass to the starting state.
   * @template TInput, TRequest
   */
  startStateMachine<TInput = unknown>(input?: TInput): Promise<void>
}

export default StateMachineClient
