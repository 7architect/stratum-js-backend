import { UserCreatedEvent } from './user-created.event'
import { UserDeletedEvent } from './user-deleted.event'
import { UserEmailChangedEvent } from './user-email-changed.event'
import { UserRevokeLicenseAcceptanceEvent } from './user-revoke-license-acceptance.event'
import { AllowanceAddedEvent } from './allowance-added.event'
import { AllowanceRemovedEvent } from './allowance-removed.event'
import { AllowanceChangedEvent } from './allowance-changed.event'
import { AllowanceConsumedEvent } from './allowance-consumed.event'

export function isUserCreatedEvent(event: any): event is UserCreatedEvent {
  return event instanceof UserCreatedEvent
}

export function isUserDeletedEvent(event: any): event is UserDeletedEvent {
  return event instanceof UserDeletedEvent
}

export function isUserEmailChangedEvent(event: any): event is UserEmailChangedEvent {
  return event instanceof UserEmailChangedEvent
}

export function isUserRevokeLicenseAcceptanceEvent(event: any): event is UserRevokeLicenseAcceptanceEvent {
  return event instanceof UserRevokeLicenseAcceptanceEvent
}

export function isAllowanceAddedEvent(event: any): event is AllowanceAddedEvent {
  return event instanceof AllowanceAddedEvent
}

export function isAllowanceRemovedEvent(event: any): event is AllowanceRemovedEvent {
  return event instanceof AllowanceRemovedEvent
}

export function isAllowanceChangedEvent(event: any): event is AllowanceChangedEvent {
  return event instanceof AllowanceChangedEvent
}

export function isAllowanceConsumedEvent(event: any): event is AllowanceConsumedEvent {
  return event instanceof AllowanceConsumedEvent
}
