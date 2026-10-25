import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { geocode, geocoderCredit } from './geocode';

export default function App() {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [message, setMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCoordinates({ latitude, longitude });

      // Animate map to user's current location
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1500);
    })();
  }, []);

  const onShowPress = async () => {
    if (!address.trim() || searching) return;
    setSearching(true);
    setMessage('');
    try {
      const newCoordinates = await geocode(address.trim());
      if (!newCoordinates) {
        setMessage(`Address not found: ${address}`);
        return;
      }

      // Update state
      setCoordinates(newCoordinates);

      // Animate the map to new region
      mapRef.current?.animateToRegion({
        ...newCoordinates,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1500); // 1500 milliseconds
    } catch (error) {
      console.error("An error occurred:", error);
      setMessage('Search failed, try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter address"
        onChangeText={setAddress}
        value={address}
      />
      <Button title="Show" onPress={onShowPress} disabled={searching} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 60.1699,
          longitude: 24.9384,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* react-native-maps on Android calls getDouble on the coordinate, so a null one crashes */}
        {coordinates && (
          <Marker
            coordinate={coordinates}
            title={address}
          />
        )}
      </MapView>
      <Text style={styles.credit}>{geocoderCredit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
  },
  message: {
    color: '#b00020',
    marginVertical: 5,
  },
  map: {
    width: '100%',
    height: '70%',
  },
  credit: {
    fontSize: 11,
    color: 'gray',
    marginTop: 4,
  },
});
