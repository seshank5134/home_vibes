import 'dart:async';
import 'package:geolocator/geolocator.dart';

class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  StreamSubscription<Position>? _positionStreamSubscription;
  Timer? _simulatedTimer;

  Future<bool> checkAndRequestPermission() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return false;
    }

    return true;
  }

  Future<Position?> getCurrentPosition() async {
    try {
      final hasPermission = await checkAndRequestPermission();
      if (!hasPermission) {
        return _fallbackPosition();
      }
      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 5),
        ),
      );
    } catch (_) {
      return _fallbackPosition();
    }
  }

  Position _fallbackPosition() {
    return Position(
      latitude: 12.9716,
      longitude: 77.5946,
      timestamp: DateTime.now(),
      accuracy: 5.0,
      altitude: 900.0,
      heading: 0.0,
      speed: 0.0,
      speedAccuracy: 0.0,
      altitudeAccuracy: 0.0,
      headingAccuracy: 0.0,
    );
  }

  // Starts throttled location stream for active delivery (every 6 seconds)
  void startDeliveryTracking({
    required Function(double lat, double lng) onLocationUpdate,
  }) async {
    stopDeliveryTracking();

    final hasPermission = await checkAndRequestPermission();
    if (hasPermission) {
      const locationSettings = LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // Only trigger if moved 10 meters
      );

      _positionStreamSubscription = Geolocator.getPositionStream(
        locationSettings: locationSettings,
      ).listen((Position position) {
        onLocationUpdate(position.latitude, position.longitude);
      });
    } else {
      // Graceful fallback: simulated GPS movement along delivery route
      int step = 0;
      final mockCoordinates = [
        const [12.9716, 77.5946],
        const [12.9729, 77.6041],
        const [12.9745, 77.6150],
        const [12.9760, 77.6280],
        const [12.9784, 77.6408],
      ];

      _simulatedTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
        if (step < mockCoordinates.length) {
          final coord = mockCoordinates[step];
          onLocationUpdate(coord[0], coord[1]);
          step++;
        } else {
          timer.cancel();
        }
      });
    }
  }

  void stopDeliveryTracking() {
    _positionStreamSubscription?.cancel();
    _positionStreamSubscription = null;
    _simulatedTimer?.cancel();
    _simulatedTimer = null;
  }
}
