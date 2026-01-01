import { BaseDomainEvent } from '@domain/events/domain-event.interface'

export class UserRevokeLicenseAcceptanceEvent extends BaseDomainEvent {
  constructor(
    public readonly userId: string,
    public readonly revokedAt: Date,
    public readonly lastLicenseAcceptedAt: Date | null
  ) {
    super('user:revoke-license-acceptance')
  }
}
