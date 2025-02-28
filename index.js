import bodyParser from 'body-parser';
import express from 'express'
import Stripe from 'stripe';
import { config } from './lib/config.js';
import { proxyStripeWebhookRequest } from './lib/stripeProxy.js'
import { validateFrontRequest, proxyFrontWebhookRequest } from './lib/front/frontProxy.js'

const app = express();

const stripe = new Stripe(config.stripeSecretKey);

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (request, response) => {
    // verify webhook request
    if (config.stripeVerifyWebhookSignature) {
        const signature = request.headers['stripe-signature'];

        try {
            stripe.webhooks.constructEvent(
                request.body,
                signature,
                config.stripeEndpointSecret
            );
        } catch (err) {
            response.sendStatus(400);
            return;
        }
    }

    // proxy request if valid
    proxyStripeWebhookRequest(request);

    // immediately return 200 to Stripe
    response.sendStatus(200);
});

app.post('/webhooks/front', bodyParser.json(), async (request, response) => {
    // verify webhook request
    if (!validateFrontRequest(request)) {
        response.sendStatus(400).json({ type: 'bad_request', message: 'Signature not verified' });
    }

    // proxy request if valid
    const { json, status } = await proxyFrontWebhookRequest(request);

    response.status(status).json(json);
});

app.listen(config.port, () => console.log(`Proxy listening for requests on port: ${config.port}`));
