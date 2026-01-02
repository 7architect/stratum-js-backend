#!/usr/bin/env bun
import { initializeDatabase } from './src/infra/adapters/mongo'
import { UploadIntentServiceFacade } from './src/infra/facade/upload-intent-service.facade'
import { UploadServiceFacade } from './src/infra/facade/upload-service.facade'

async function testIntentFlow() {
  console.log('🚀 Starting Intent Flow Test\n')

  // Initialize DB
  await initializeDatabase()

  const intentService = UploadIntentServiceFacade.getInstance()
  const uploadService = UploadServiceFacade.getInstance()

  // Step 1: Create intent
  console.log('📝 Step 1: Creating intent...')
  const intent = await intentService.createIntent({
    sizeLimit: 5000000,
    mimeType: 'image/png',
  })
  console.log(`✅ Intent created: ${intent.id}`)
  console.log(`   Storage key: ${intent.key}`)
  console.log(`   Presigned URL: ${intent.presignedUrl.substring(0, 80)}...`)
  console.log()

  // Step 2: Simulate file upload to S3
  console.log('📤 Step 2: Simulating file upload to S3...')
  console.log('   (In real scenario, client would PUT file to presigned URL)')

  // Create a test PNG file
  const testPngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
    0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
    0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
    0x44, 0xAE, 0x42, 0x60, 0x82
  ])

  // Upload to S3 using presigned URL
  const uploadResponse = await fetch(intent.presignedUrl, {
    method: 'PUT',
    body: testPngData,
    headers: {
      'Content-Type': 'image/png',
    },
  })

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.statusText}`)
  }
  console.log('✅ File uploaded to S3')
  console.log()

  // Step 3: Validate intent
  console.log('🔍 Step 3: Validating intent...')
  try {
    await intentService.validateIntent(intent.id)
    console.log('✅ Intent is valid')
  } catch (error) {
    console.error('❌ Validation failed:', error)
  }
  console.log()

  // Step 4: Confirm intent
  console.log('✔️  Step 4: Confirming intent...')
  try {
    const confirmedIntent = await intentService.confirmIntent(intent.id)
    console.log('✅ Intent confirmed!')
    console.log(`   Actual size: ${confirmedIntent.actualSize} bytes`)
    console.log(`   Actual MIME type: ${confirmedIntent.actualMimeType}`)
    console.log(`   Used at: ${confirmedIntent.usedAt}`)
  } catch (error) {
    console.error('❌ Confirmation failed:', error)
  }
  console.log()

  // Step 5: Check MongoDB for saved file
  console.log('🗄️  Step 5: Checking MongoDB for saved upload record...')
  await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for async event handler

  const files = await uploadService.listFiles('intent-uploads/')
  console.log(`✅ Found ${files.length} file(s) in uploads`)
  if (files.length > 0) {
    const file = files[0]
    console.log(`   File ID: ${file.id}`)
    console.log(`   Storage key: ${file.storageKey}`)
    console.log(`   Size: ${file.size} bytes`)
    console.log(`   MIME type: ${file.mimeType}`)
  }
  console.log()

  console.log('🎉 Test completed successfully!')
  process.exit(0)
}

testIntentFlow().catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
