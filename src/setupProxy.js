const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://nas8.site:3888',
      changeOrigin: true,
      secure: false,
    }),
  );
  app.use(
    '/public',
    createProxyMiddleware({
      target: 'https://nas8.site:3888',
      changeOrigin: true,
      secure: false,
    }),
  );
};
