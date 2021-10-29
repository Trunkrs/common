import QueueClient from '../../../services/queue/QueueClient'

class ParcelEventManager {
  public constructor(private readonly queue: QueueClient) {}

  public async emitParcelReceivedEvent(
    parcelId: number,
    at: number,
  ): Promise<void> {
    await this.queue.sendMessage({ message: { parcelId, at } })
  }
}
