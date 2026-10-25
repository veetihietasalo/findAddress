# findAddress

Expo app that finds an address on a map. Type an address, tap Show, and the map moves there and puts a marker on it. The app is called etsiOsoite in `app.json` (Finnish for "find address").

What it does:
- Asks for location permission on start and moves the map to the phone's current position
- Geocodes the typed address with the MapQuest Geocoding API and marks the first result
- Starts on Helsinki (60.1699, 24.9384) until a location is known

Stack: JavaScript, React Native 0.72, Expo SDK 49, `react-native-maps`, `expo-location`. All the code is in `App.js`.

Run it:

```
npm install
npm start
```

`npm start` runs `expo start`. `npm run android` and `npm run ios` are in `package.json` too. The project is on Expo SDK 49, so Expo Go has to be a version that supports SDK 49. Geocoding needs a MapQuest API key, set as `API_KEY` in `App.js`.

Status: course assignment, mobile programming at a university of applied sciences, October 2023. No tests.
