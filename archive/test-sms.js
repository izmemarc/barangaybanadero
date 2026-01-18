/**
 * PhilSMS API Test Script
 * 
 * Usage: node scripts/test-sms.js
 * 
 * Make sure you have the following in your .env.local:
 * - PHILSMS_API_TOKEN=your-api-token
 * - PHILSMS_NOTIFICATION_NUMBER=639171234567
 * - PHILSMS_SENDER_ID=YourSenderID (optional, defaults to PhilSMS)
 */

require('dotenv').config({ path: '.env.local' })

async function testSMS() {
  const apiToken = process.env.PHILSMS_API_TOKEN
  const phoneNumber = process.env.PHILSMS_NOTIFICATION_NUMBER
  const senderId = process.env.PHILSMS_SENDER_ID || 'PhilSMS'

  console.log('=== PhilSMS API Test ===\n')

  // Check configuration
  if (!apiToken) {
    console.error('❌ PHILSMS_API_TOKEN not found in .env.local')
    process.exit(1)
  }

  if (!phoneNumber) {
    console.error('❌ PHILSMS_NOTIFICATION_NUMBER not found in .env.local')
    process.exit(1)
  }

  console.log('✓ API Token found')
  console.log('✓ Phone number:', phoneNumber)
  console.log('✓ Sender ID:', senderId)
  console.log('\nSending test SMS...\n')

  try {
    const response = await fetch('https://dashboard.philsms.com/api/v3/sms/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        recipient: phoneNumber,
        sender_id: senderId,
        type: 'plain',
        message: 'Test message from Barangay Website - SMS notifications are working!',
      }),
    })

    const data = await response.json()

    console.log('Response:', JSON.stringify(data, null, 2))

    if (data.status === 'success') {
      console.log('\n✅ SMS sent successfully!')
      console.log('Check your phone for the test message.')
    } else {
      console.error('\n❌ SMS failed:', data.message || 'Unknown error')
      if (data.errors) {
        console.error('Errors:', data.errors)
      }
    }
  } catch (error) {
    console.error('\n❌ Network error:', error.message)
    process.exit(1)
  }
}

// Run the test
testSMS()
