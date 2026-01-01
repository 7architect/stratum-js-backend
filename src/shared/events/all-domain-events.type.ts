import { UserCreatedEvent } from '@users/domain/events/user-created.event'
import { UserDeletedEvent } from '@users/domain/events/user-deleted.event'
import { UserEmailChangedEvent } from '@users/domain/events/user-email-changed.event'
import { UserRevokeLicenseAcceptanceEvent } from '@users/domain/events/user-revoke-license-acceptance.event'
import { AllowanceAddedEvent } from '@users/domain/events/allowance-added.event'
import { AllowanceRemovedEvent } from '@users/domain/events/allowance-removed.event'
import { AllowanceChangedEvent } from '@users/domain/events/allowance-changed.event'
import { AllowanceConsumedEvent } from '@users/domain/events/allowance-consumed.event'

export type AllDomainEvents =
  | UserCreatedEvent
  | UserDeletedEvent
  | UserEmailChangedEvent
  | UserRevokeLicenseAcceptanceEvent
  | AllowanceAddedEvent
  | AllowanceRemovedEvent
  | AllowanceChangedEvent
  | AllowanceConsumedEvent
