import dotenv from 'dotenv'

dotenv.config();

export const config = {
    herokuAPIKey: process.env.HEROKU_API_KEY,
    herokuPipelineId: process.env.HEROKU_PIPELINE_ID,
    port: process.env.PORT,
    stripeEndpointSecret: process.env.STRIPE_ENDPOINT_SECRET,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeVerifyWebhookSignature: process.env.STRIPE_VERIFY_WEBHOOK_SIGNATURE,
    testProxyURL: process.env.TEST_PROXY_URL,
    stripeWebhookPath: process.env.STRIPE_WEBHOOK_PATH,
    frontWebhookPath: process.env.FRONT_WEBHOOK_PATH,
    frontBearer: process.env.FRONT_ACCEPTED_BEARER_TOKEN,
    frontApplicationChannelSecret: process.env.FRONT_APPLICATION_CHANNEL_SECRET
};
