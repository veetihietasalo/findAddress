const { getDefaultConfig } = require('expo/metro-config');

// CSS imports are needed for Leaflet's stylesheet in the web build (maps.web.js).
module.exports = getDefaultConfig(__dirname, { isCSSEnabled: true });
