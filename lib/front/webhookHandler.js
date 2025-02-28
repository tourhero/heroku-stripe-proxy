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
          json: { type: 'success', webhook_url: `https://${this.request.get('host')}/webhooks/front` },
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
          // Review App Chatroom IDs are joined with { Heroku PR Number } and { sprintf("%03d", chatroom_id) }
          target: externalId.toString().slice(0, -3),
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