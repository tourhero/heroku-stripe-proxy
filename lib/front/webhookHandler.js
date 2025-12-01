class WebhookHandler {
  constructor(request) {
    this.request = request
    this.parseRequest()
  }

  process() {
    switch (this.requestType) {

      case 'authorization':
        return {
          requestType: this.requestType,
          json: { type: 'success', webhook_url: `https://${this.request.get('host')}/webhook_front` },
        }

      case 'sync':
        return {
          requestType: this.requestType,
          json: { type: 'success', challenge: request.headers['X-Front-Challenge'] },
        }
      default:
        const externalId = this.metadata['external_conversation_id']

        return {
          requestType: this.requestType,
          // Review App Chatroom IDs take the format: `${PR_Number}-{6_char_Base58_encoded_random_string}`
          target: externalId.split("-")[0],
          json: { type: 'success', message: 'Event forwarded' },
        }
    }
  }

  parseRequest() {
    const body = this.request.body

    this.requestType = body.type
    this.requestPayload = body.payload
    this.metadata = body.metadata
  }
}

export default WebhookHandler