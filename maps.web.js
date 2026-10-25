// Web stand-in for react-native-maps, which has no web support. It covers the props this app
// uses (MapView initialRegion + style, ref.animateToRegion, Marker coordinate + title) and draws
// them with Leaflet and OpenStreetMap tiles.
import React, { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapContext = createContext(null);

// react-native-maps works in latitude deltas, Leaflet in zoom levels.
const zoomFor = (latitudeDelta) => Math.max(2, Math.min(18, Math.round(Math.log2(360 / latitudeDelta))));

const MapView = forwardRef(function MapView({ initialRegion, style, children }, ref) {
  const container = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const leafletMap = L.map(container.current).setView(
      [initialRegion.latitude, initialRegion.longitude],
      zoomFor(initialRegion.latitudeDelta),
    );
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap);
    // The container only gets its final size after layout.
    const observer = new ResizeObserver(() => leafletMap.invalidateSize());
    observer.observe(container.current);
    setMap(leafletMap);
    return () => {
      observer.disconnect();
      leafletMap.remove();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    animateToRegion(region, duration = 1000) {
      map?.flyTo([region.latitude, region.longitude], zoomFor(region.latitudeDelta), { duration: duration / 1000 });
    },
  }), [map]);

  return (
    <View style={style}>
      <div ref={container} style={{ width: '100%', height: '100%' }} data-testid="map" />
      {map && <MapContext.Provider value={map}>{children}</MapContext.Provider>}
    </View>
  );
});

export function Marker({ coordinate, title }) {
  const map = useContext(MapContext);
  const { latitude, longitude } = coordinate || {};

  useEffect(() => {
    if (!map || latitude === undefined) return undefined;
    const marker = L.circleMarker([latitude, longitude], { radius: 9, color: '#c62828', fillOpacity: 0.8 }).addTo(map);
    if (title) {
      // A text node, so a typed address is never parsed as HTML.
      const label = document.createElement('span');
      label.textContent = title;
      marker.bindTooltip(label);
    }
    return () => marker.remove();
  }, [map, latitude, longitude, title]);

  return null;
}

export default MapView;
