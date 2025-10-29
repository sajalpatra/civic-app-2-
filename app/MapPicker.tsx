import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100vw; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const initialData = window.initialData || { lat: 20.5937, lng: 78.9629, zoom: 5 };
    const map = L.map('map').setView([initialData.lat, initialData.lng], initialData.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ' OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    let marker = L.marker([initialData.lat, initialData.lng], { draggable: true }).addTo(map);

    marker.on('dragend', function(e) {
      const position = marker.getLatLng();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        lat: position.lat,
        lng: position.lng
      }));
    });

    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      }));
    });

    document.addEventListener('message', function(e) {
      try {
        const data = JSON.parse(e.data);
        if (data.action === 'centerMap') {
          map.setView([data.lat, data.lng], 14);
          marker.setLatLng([data.lat, data.lng]);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            lat: data.lat,
            lng: data.lng
          }));
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    });

    window.addEventListener('message', function(e) {
      try {
        const data = JSON.parse(e.data);
        if (data.action === 'centerMap') {
          map.setView([data.lat, data.lng], 14);
          marker.setLatLng([data.lat, data.lng]);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            lat: data.lat,
            lng: data.lng
          }));
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    });
  </script>
</body>
</html>
`;

export default function MapPicker({
  visible,
  onClose,
  onLocationSelected,
  initialLocation,
}: MapPickerProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (webViewRef.current) {
        const centerCommand = JSON.stringify({
          action: "centerMap",
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
        webViewRef.current.postMessage(centerCommand);
      }
    } catch (error) {
      console.error("Error getting current location:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      const { lat, lng } = data;

      setSelectedLocation({ latitude: lat, longitude: lng });
    } catch (error) {
      console.error("Error parsing message from WebView:", error);
    }
  };

  const handleConfirm = async () => {
    if (!selectedLocation) {
      return;
    }

    try {
      setLoading(true);
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });

      let address = "Unknown location";
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        address = ` , , `.trim();
      }

      onLocationSelected({
        ...selectedLocation,
        address,
      });
      onClose();
    } catch (error) {
      console.error("Error getting address:", error);
      onLocationSelected(selectedLocation);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const initialData = {
    lat: initialLocation?.latitude || 20.5937,
    lng: initialLocation?.longitude || 78.9629,
    zoom: initialLocation ? 14 : 5,
  };

  const injectedJavaScript = `
    window.initialData = ;
    true;
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[
              styles.headerButton,
              !selectedLocation && styles.headerButtonDisabled,
            ]}
            disabled={!selectedLocation || loading}
          >
            <Text
              style={[
                styles.headerButtonText,
                styles.confirmText,
                !selectedLocation && styles.headerButtonTextDisabled,
              ]}
            >
              {loading ? "..." : "Confirm"}
            </Text>
          </TouchableOpacity>
        </View>

        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: LEAFLET_HTML }}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleWebViewMessage}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Getting location...</Text>
          </View>
        )}

        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Tap on the map to select a location or drag the marker
          </Text>
        </View>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={getCurrentLocation}
          disabled={loading}
        >
          <Text style={styles.currentLocationText}>Use Current Location</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerButtonText: {
    fontSize: 16,
    color: "#3B82F6",
  },
  headerButtonTextDisabled: {
    color: "#9ca3af",
  },
  confirmText: {
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#4b5563",
  },
  instructions: {
    position: "absolute",
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsText: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  currentLocationText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
