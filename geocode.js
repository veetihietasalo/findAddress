import { Platform } from 'react-native';

// Optional. Set in .env (see .env.example). Expo inlines EXPO_PUBLIC_ values into the JS bundle
// at build time, so a key set here can be read by anyone with the app.
const MAPQUEST_KEY = process.env.EXPO_PUBLIC_MAPQUEST_KEY;

// Without a MapQuest key the app uses OpenStreetMap Nominatim, which needs no key. Its usage
// policy (https://operations.osmfoundation.org/policies/nominatim/): at most 1 request per second,
// identify the app, show attribution, no search-as-you-type. The app sends one request per tap.
export const usingNominatim = !MAPQUEST_KEY;
export const geocoderCredit = usingNominatim
  ? 'Search by OpenStreetMap Nominatim, data © OpenStreetMap contributors'
  : 'Search by MapQuest';

let lastNominatimRequest = 0;

// Returns { latitude, longitude } for the first match, or null if nothing was found.
export async function geocode(address) {
  if (MAPQUEST_KEY) {
    const url = `https://www.mapquestapi.com/geocoding/v1/address?key=${MAPQUEST_KEY}&location=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`MapQuest HTTP ${response.status}`);
    const data = await response.json();
    const location = data.results?.[0]?.locations?.[0];
    return location ? { latitude: location.latLng.lat, longitude: location.latLng.lng } : null;
  }

  const wait = lastNominatimRequest + 1000 - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastNominatimRequest = Date.now();

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const response = await fetch(url, {
    // Browsers send their own User-Agent and Referer. On a phone, name the app as the policy asks.
    headers: Platform.OS === 'web' ? {} : { 'User-Agent': 'findAddress (https://github.com/veetihietasalo/findAddress)' },
  });
  if (!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);
  const results = await response.json();
  return results[0] ? { latitude: Number(results[0].lat), longitude: Number(results[0].lon) } : null;
}
