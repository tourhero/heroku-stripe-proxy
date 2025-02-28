import axios from 'axios'
import { config } from './config.js'
import { getApps, getAppURLs } from './heroku.js';

/**
 * Proxies request to each given base URL with path
 *
 * @param {Object} request - Express request object
 * @param {Array<string>} appURLs - array of base URL strings
 * @param {string} path - URL path string
 * @returns {Promise<void>}
 */
export async function sendRequests(request, appURLs, path) {
    try {
        await Promise.all(
            appURLs.map(appURL => {
                const headers = { ...request.headers };

                headers.host = appURL.replace(
                    /(^https:\/\/)|(^http:\/\/)|(\/$)/g,
                    ''
                );
                const reviewAppWebhookUrl = `${appURL}${path}`;
                console.log(`Sending request to: ${reviewAppWebhookUrl}`);
                return axios.post(reviewAppWebhookUrl, request.body, {
                    headers,
                });
            })
        );
    } catch (error) {
        // proxied request returned error
        // error logging would go here, but for now just catch the error
    }
}

/**
 * Proxies given request to all Heroku apps belonging to the
 * configured pipeline
 *
 * @param {Object} request - Express request object
 * @returns {Promise<void>}
 */
export async function proxyStripeWebhookRequest(request) {
    const { herokuPipelineId, stripeWebhookPath } = config;

    // get all Heroku apps for configured pipeline
    const appIds = await getApps(herokuPipelineId);

    // get URL for each Heroku app
    const appURLs = await getAppURLs(appIds);

    // proxy original request to each app
    await sendRequests(request, appURLs, stripeWebhookPath);
}
