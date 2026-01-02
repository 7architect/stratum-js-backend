import { type EventBusPort } from '@/users/application/ports/event-bus.port'
import { UserCreatedIntegrationEvent } from '@/users/application/integration-events/user-created.integration-event'
import { UserDeletedIntegrationEvent } from '@/users/application/integration-events/user-deleted.integration-event'
import { UserLicenseChangedIntegrationEvent } from '@/users/application/integration-events/user-license-changed.integration-event'
import { UserAllowancesChangedIntegrationEvent } from '@/users/application/integration-events/user-allowances-changed.integration-event'
import { FileUploadedIntegrationEvent } from '@/upload/application/integration-events/file-uploaded.integration-event'
import { FileMetadataUpdatedIntegrationEvent } from '@/upload/application/integration-events/file-metadata-updated.integration-event'
import { FileDeletedIntegrationEvent } from '@/upload/application/integration-events/file-deleted.integration-event'
import { UploadIntentConfirmedIntegrationEvent } from '@/upload/application/integration-events/upload-intent-confirmed.integration-event'

/**
 * Setup all Integration Event handlers at app root level
 * Handlers listen to Integration Events published by domain services
 * Use this for cross-cutting concerns like logging, notifications, analytics, etc.
 */
export function setupEventHandlers(eventBus: EventBusPort): void {
  // ============================================
  // USER INTEGRATION EVENTS
  // ============================================

  eventBus.subscribe('user:created', async (event: UserCreatedIntegrationEvent) => {
    console.log('[EVENT] User created:', {
      id: event.payload.id,
      email: event.payload.email,
      createdAt: new Date(event.payload.createdAt).toISOString(),
    })
    // TODO: Add your notification/logging/analytics logic here
    // Example: await notificationService.sendWelcomeEmail(event.payload.email)
  })

  eventBus.subscribe('user:deleted', async (event: UserDeletedIntegrationEvent) => {
    console.log('[EVENT] User deleted:', {
      id: event.payload.id,
      email: event.payload.email,
      deletedAt: event.payload.deletedAt ? new Date(event.payload.deletedAt).toISOString() : null,
    })
    // TODO: Add cleanup logic here
    // Example: await storageService.deleteUserData(event.payload.id)
  })

  eventBus.subscribe('user:license-changed', async (event: UserLicenseChangedIntegrationEvent) => {
    console.log('[EVENT] User license changed:', {
      id: event.payload.id,
      email: event.payload.email,
      licenseAcceptedAt: event.payload.licenseAcceptedAt ? new Date(event.payload.licenseAcceptedAt).toISOString() : null,
    })
    // TODO: Add license tracking logic here
    // Example: await analyticsService.trackLicenseChange(event.payload)
  })

  eventBus.subscribe('user:allowances-changed', async (event: UserAllowancesChangedIntegrationEvent) => {
    console.log('[EVENT] User allowances changed:', {
      id: event.payload.id,
      email: event.payload.email,
      allowancesCount: event.payload.allowances.length,
    })
    // TODO: Add quota tracking logic here
    // Example: await quotaService.updateUserQuota(event.payload)
  })

  // ============================================
  // UPLOAD INTEGRATION EVENTS
  // ============================================

  eventBus.subscribe('file:uploaded', async (event: FileUploadedIntegrationEvent) => {
    console.log('[EVENT] File uploaded:', {
      id: event.payload.id,
      userId: event.payload.userId,
      filename: event.payload.filename,
      size: event.payload.size,
    })
    // TODO: Add post-upload processing logic here
    // Example: await thumbnailService.generateThumbnail(event.payload)
  })

  eventBus.subscribe('file:metadata-updated', async (event: FileMetadataUpdatedIntegrationEvent) => {
    console.log('[EVENT] File metadata updated:', {
      id: event.payload.id,
      filename: event.payload.filename,
    })
    // TODO: Add metadata indexing logic here
    // Example: await searchService.indexFile(event.payload)
  })

  eventBus.subscribe('file:deleted', async (event: FileDeletedIntegrationEvent) => {
    console.log('[EVENT] File deleted:', {
      id: event.payload.id,
      filename: event.payload.filename,
    })
    // TODO: Add cleanup logic here
    // Example: await cacheService.invalidate(event.payload.id)
  })

  eventBus.subscribe('upload:intent-confirmed', async (event: UploadIntentConfirmedIntegrationEvent) => {
    console.log('[EVENT] Upload intent confirmed:', {
      id: event.payload.id,
      userId: event.payload.userId,
    })
    // TODO: Add upload preparation logic here
    // Example: await storageService.prepareUploadSpace(event.payload)
  })
}
