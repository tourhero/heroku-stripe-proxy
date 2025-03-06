import { createHmac } from 'crypto';
import axios from 'axios'

import WebhookHandler from './webhookHandler.js';
import { getAppURLWithPRNumber } from '../heroku.js';
import { config } from '../config.js'


/**
 * Proxies request to each given base URL with path
 *
 * @param {Object} request - Express request object
 * @param {string} appURL - base URL strings
 * @param {string} path - URL path string
 * @returns {Promise<void>}
 */
async function sendRequest(request, appUrl, path) {
    try {
        const headers = { ...request.headers };

        headers.host = appUrl.replace(
            /(^https:\/\/)|(^http:\/\/)|(\/$)/g,
            ''
        );
        const reviewAppWebhookUrl = `${appUrl}${path}`;

        console.log(`Sending request to: ${reviewAppWebhookUrl}`);

        const reviewAppResponse = await axios.post(reviewAppWebhookUrl, request.body, {
            headers,
        });

        return reviewAppResponse.data
    } catch (error) {
        console.log(error)
        return { json: { type: "bad_request", message: "Something went wrong." }, status: 400 }
    }
}

/**
 * Proxies given request to all Heroku apps belonging to the
 * configured pipeline
 *
 * @param {Object} request - Express request object
 * @returns {Promise<void>}
 */
export async function proxyFrontWebhookRequest(request) {
    const { herokuPipelineId, frontWebhookPath } = config;

    const handler = new WebhookHandler(request)
    const { requestType, json, target } = handler.process()

    if (["authorization", "sync"].includes(requestType) && !target) {
        console.log(`Authorizing for Front Channel ID: ${request.body.payload["channel_id"]}`)
        console.log(`Original Request Body Payload: ${JSON.stringify(request.body.payload)}`)
        return { json, status: 200 }
    };

    // get all Heroku apps for configured pipeline
    const appUrl = await getAppURLWithPRNumber(herokuPipelineId, target)

    if (!appUrl) return { json: { type: 'bad_request', message: `TourHero Review App ${target} not found.` }, status: 400 };

    // proxy original request to each app
    const reviewAppResponse = await sendRequest(request, appUrl, frontWebhookPath);

    return { json: reviewAppResponse, status: 200 }
}

function validateOnAuthorizationRequest(request) {
    return request.headers.authorization == `Bearer ${config.frontBearer}` || request["type"] != "authorization"
}

export function validateFrontRequest(request) {
    if (!validateOnAuthorizationRequest(request)) {
        return false
    }

    const timestamp = request.headers['x-front-request-timestamp'];
    const rawBody = JSON.stringify(request.body);
    const baseString = `${timestamp}:${rawBody}`;

    const hmac = createHmac('sha256', config.frontApplicationChannelSecret)
        .update(baseString)
        .digest('base64');

    if (hmac !== request.headers['x-front-signature']) {
        return false
    }

    return true
}