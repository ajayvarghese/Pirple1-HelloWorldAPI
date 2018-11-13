var environments = {};

// STAGING
environments.staging = {
  'httpPort': 3001,
  'httpsPort' : 3002,
  'envName': 'staging',
};

// PRODUCTION
environments.production = {
  'httpPort': 3005,
  'httpsPort' : 3006,
  'envName': 'production',
};

const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const environmentToExport = typeof environments[currentEnvironment] === 'object' ?  environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;