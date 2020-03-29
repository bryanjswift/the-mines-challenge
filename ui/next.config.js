module.exports = (phase, { defaultConfig }) => {
  return {
    env: {
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
    },
  };
};
