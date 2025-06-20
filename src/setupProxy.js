// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // If your frontend calls start with /api
    createProxyMiddleware({
      target: 'http://localhost:3001', // Your local backend server
      changeOrigin: true,
    })
  );
};