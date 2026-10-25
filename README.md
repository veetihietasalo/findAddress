# findAddress

Expo app that finds an address on a map. Type an address, tap Show, and the map moves there and puts a marker on it. The app is called etsiOsoite in `app.json` (Finnish for "find address"). Runs on a phone and as a web page.

What it does:
- Asks for location permission on start and moves the map to the current position
- Geocodes the typed address and marks the first result, or says "Address not found"
- Geocoding uses MapQuest if `EXPO_PUBLIC_MAPQUEST_KEY` is set, otherwise OpenStreetMap Nominatim, which needs no key
- Starts on Helsinki (60.1699, 24.9384) with no marker until a location is known

On a phone the map is `react-native-maps`. On the web it's Leaflet with OpenStreetMap tiles (`maps.web.js`), since react-native-maps has no web support.

Stack: JavaScript, React Native 0.72, Expo SDK 49, `react-native-maps`, `expo-location`, Leaflet 1.9 and react-native-web for the web build. The app is `App.js`, `geocode.js` and `maps.js` / `maps.web.js`.

Run it on a phone:

```
npm install
npm start
```

`npm run android` and `npm run ios` are in `package.json` too. Expo Go from the app stores only runs the latest SDK, so running it on a phone now needs an SDK upgrade first.

MapQuest is optional: copy `.env.example` to `.env` and set `EXPO_PUBLIC_MAPQUEST_KEY` (a key from developer.mapquest.com), then restart with `npx expo start --clear`. `.env` is git-ignored. Expo writes `EXPO_PUBLIC_` values into the JS bundle, so anyone with a build can read the key. Leave it out for a public web build.

Nominatim has a usage policy (https://operations.osmfoundation.org/policies/nominatim/): at most one request per second, the app identified, attribution shown, no search-as-you-type. The app sends one request per tap on Show, waits if the last one was under a second ago, names itself in the User-Agent on phones, and shows "Search by OpenStreetMap Nominatim, data © OpenStreetMap contributors" under the map.

Web build:

```
npm run build:web     # static site in dist/
npm run deploy:web    # build:web, then push dist/ to the gh-pages branch
```

`build:web` runs `expo export --platform web` and then `scripts/web-relative-paths.js`, which makes the paths relative (SDK 49 has no base URL setting) and writes `.nojekyll`, so the site works from `https://veetihietasalo.github.io/findAddress/`. `deploy:web` runs `scripts/deploy-web.sh`, which builds the gh-pages branch from `dist/` only and pushes it without force. GitHub Pages has to be set to the gh-pages branch once in the repo settings. To try the build locally, copy `dist/` to `site/findAddress/`, run `python3 -m http.server -d site` and open `http://localhost:8000/findAddress/`.

Review, Oct 2026:
- The MapQuest key was hard-coded in `App.js`. It's revoked and now optional, from `EXPO_PUBLIC_MAPQUEST_KEY`. The old value is still in git history, it's dead.
- The marker got `coordinate={null}` until the first location came in. react-native-maps on Android reads that with no null check, so it could crash on start. The marker now renders only once there's a coordinate.
- Geocoding went over plain http with the key in the URL. It's https now, and the address is URL-encoded, so `&` or `#` in it don't cut the query short.
- "Address not found" and search errors show on screen instead of only in the console.

Still open:
- No tests. Not run on a phone or emulator in this review, only bundled with `npx expo export` for Android, iOS and the web. The web build was checked in headless Chromium.
- The dependencies are the 2023 SDK 49 set. `npx expo install --check` wants expo-location ~16.1.0 (we have 16.3.0) and react-native 0.72.10 (0.72.5), and npm audit lists advisories in that tree. The fix is an SDK upgrade.

Status: course assignment, mobile programming at a university of applied sciences, October 2023. Key moved out, review fixes and web build in October 2026.
