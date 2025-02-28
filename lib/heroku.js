import axios from 'axios'
import { config } from './config.js'

const tourheroPrPrefix = 'tourhero-pr'
const herokuBaseURL = 'https://api.heroku.com/';
const herokuRequestHeaders = {
  Accept: 'application/vnd.heroku+json; version=3',
  Authorization: `Bearer ${config.herokuAPIKey}`,
};

/**
 * Returns an array of URLS for the passed in Heroku App IDs
 *
 * @param {Array<string>} appIds - array of Heroku app ID strings
 * @returns {Promise<string>} appURLs - array of web URLs for each app
 */
export async function getAppURLs(appIds) {
  // return configured URL for testing, if any
  if (config.testProxyURL) {
    return [config.testProxyURL];
  }

  let appURLs = [];

  try {
    appURLs = await Promise.all(
      appIds.map(async reviewAppId => {
        const appId = reviewAppId;
        const appPath = `apps/${appId}`;
        const app = await axios.get(`${herokuBaseURL}${appPath}`, {
          headers: herokuRequestHeaders,
        });

        return app.data.web_url;
      })
    );
  } catch (error) {
    // failed to fetch one or more apps
    // error logging would go here, but for now just catch the error
  }
  return appURLs;
}

export async function getAppURLWithPRNumber(pipelineId, target) {
  // return configured URL for testing, if any
  if (config.testProxyURL) {
    return [config.testProxyURL];
  }

  try {
    const path = `pipelines/${pipelineId}/review-apps`;
    const reviewApps = await axios.get(`${herokuBaseURL}${path}`, {
      headers: herokuRequestHeaders,
    });

    const targetApp = reviewApps.data.find((reviewApp) => reviewApp.pr_number == target)

    if (targetApp) return `https://${tourheroPrPrefix}-${targetApp.pr_number}.herokuapp.com`;
  } catch (error) {
    // failed to fetch one or more apps
    // error logging would go here, but for now just catch the error
  }
  return appURLs;
}

/**
 * Returns an array of Heroku apps that belong to the given pipeline
 *
 * @param {string} pipelineId - Heroku pipeline ID string
 * @returns {Promise<Array>} - array of Heroku app ID strings
 */
export async function getApps(pipelineId) {
  // get review apps for pipeline from Heroku
  const path = `pipelines/${pipelineId}/review-apps`;

  let reviewAppIds = [];

  try {
    const reviewAppsResponse = await axios.get(`${herokuBaseURL}${path}`, {
      headers: herokuRequestHeaders,
    });
    reviewAppIds = reviewAppsResponse.data
      .filter(reviewApp => reviewApp.status == 'created')
      .map(reviewApp => reviewApp.app.id);
  } catch (error) {
    // failed to get review apps for pipeline
    // error logging would go here, but for now just catch the error
  }

  return reviewAppIds;
}