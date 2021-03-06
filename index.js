/**
 * Central module for building RESTful web services.
 *
 * @module x2node-ws
 * @requires module:x2node-common
 */
'use strict';

const Application = require('./lib/application.js');
const ServiceResponse = require('./lib/service-response.js');


/**
 * Node.js <code>http.IncomingMessage</code> object.
 *
 * @external http.IncomingMessage
 * @see {@link https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_class_http_incomingmessage}
 */
/**
 * Node.js <code>http.ServerResponse</code> object.
 *
 * @external http.ServerResponse
 * @see {@link https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_class_http_serverresponse}
 */
/**
 * Node.js <code>net.Socket</code> object.
 *
 * @external net.Socket
 * @see {@link https://nodejs.org/dist/latest-v4.x/docs/api/net.html#net_class_net_socket}
 */

/**
 * Application configuration options.
 *
 * @typedef {Object} ApplicationOptions
 * @property {string} apiVersion Version of the API exposed by the application.
 * If not specified, <code>NODE_ENV</code> environment variable is examined. If
 * its value is "development", the version is set to the current timestamp so
 * that it changes each time the application is restarted. Otherwise, the version
 * is read from the main module's <code>package.json</code>.
 * @property {number} connectionIdleTimeout Timeout in milliseconds for
 * inactivity on the HTTP connection when activity is expected from the client.
 * If the timeout occurs before the server starts sending the response, a 408
 * (Request Timeout) response is sent and the connection is closed. If timeout
 * happens after the response headers have been sent, the connection is quitely
 * closed. The default is 30 seconds.
 * @property {number} maxRequestHeadersCount Maximum allowed number of incoming
 * HTTP request headers. The default is 50.
 * @property {number} maxRequestSize Maximum allowed size of request payload in
 * bytes. The default is 2048.
 * @property {(string|Array.<string>)} allowedOrigins List (comma-separated
 * string or an array) of allowed CORS origins. If not provided, the default is
 * to allow any origin.
 * @property {number} corsPreflightMaxAge Maximum age in seconds for caching CORS
 * preflight responses on the client. The default is 20 days.
 */

/**
 * Create application the represents the web service. The application must be
 * configured before it's run and starts responding to the incoming requests.
 *
 * @param {module:x2node-ws~ApplicationOptions} [options] Application
 * configuration options.
 * @returns {module:x2node-ws~Application} The application.
 */
exports.createApplication = function(options) {

	return new Application(options || {});
};

/**
 * Create new empty response object.
 *
 * @param {number} statusCode HTTP response status code.
 * @returns {module:x2node-ws~ServiceResponse} Service response object.
 */
exports.createResponse = function(statusCode) {

	return new ServiceResponse(statusCode);
};

/**
 * Tell if the provided object is response object (that is an instance of
 * [ServiceResponse]{@link module:x2node-ws~ServiceResponse}).
 *
 * @param {*} obj Object to test.
 * @returns {boolean} <code>true</code> if response object.
 */
exports.isResponse = function(obj) {

	return (obj instanceof ServiceResponse);
};

// export basic authenticator
exports.BasicAuthenticator = require('./lib/basic-authenticator.js');

// export Bearer authenticator
exports.BearerAuthenticator = require('./lib/bearer-authenticator.js');

// export caching actors registry
exports.CachingActorsRegistry = require('./lib/caching-actors-registry.js');

/**
 * Charset conversion map from MIME to Node's <code>Buffer</code>.
 *
 * @private
 * @constant {Object.<string,string>}
 */
const CHARSETS_MAP = {
	'US-ASCII': 'ascii',
	'ISO-8859-1': 'latin1',
	'UTF-8': 'utf8',
	'UTF-16LE': 'utf16le'
};

/**
 * Simple binary to string deserializer function implementation for use with
 * handler <code>requestEntityParsers</code> property.
 */
exports.TEXT_DESERIALIZER = function(data, ctype) {

	const m = /;\s*charset=(?:"([^"]+)"|([^"][^;]*))/i.exec(ctype);
	try {
		const charset = (m ? m[1] || m[2] : 'UTF-8');
		return {
			text: data.toString(CHARSETS_MAP[charset.toUpperCase()] || charset)
		};
	} catch (err) {
		throw (new ServiceResponse(415)).setEntity({
			errorCode: 'X2-415',
			errorMessage: err.message
		});
	}
};
