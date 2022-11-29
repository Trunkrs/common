interface MachineTokenClientBase {
  getMachineToken(): Promise<string>
}

export default MachineTokenClientBase
