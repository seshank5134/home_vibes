import 'package:flutter/material.dart';
import '../models/order_model.dart';
import '../services/supabase_service.dart';
import '../services/location_service.dart';

class DeliveryProvider extends ChangeNotifier {
  final SupabaseService _supabaseService = SupabaseService();
  final LocationService _locationService = LocationService();

  bool _isOnline = false;
  bool _isLoading = false;
  OrderModel? _activeOrder;
  List<OrderModel> _availableOrders = [];
  List<OrderModel> _deliveryHistory = [];
  String? _statusMessage;

  bool get isOnline => _isOnline;
  bool get isLoading => _isLoading;
  OrderModel? get activeOrder => _activeOrder;
  List<OrderModel> get availableOrders => _availableOrders;
  List<OrderModel> get deliveryHistory => _deliveryHistory;
  String? get statusMessage => _statusMessage;

  // Toggle Online/Offline
  Future<void> toggleOnline(String driverId) async {
    _isOnline = !_isOnline;
    notifyListeners();

    try {
      await _supabaseService.setOnlineStatus(driverId, _isOnline);
      if (_isOnline) {
        await loadAvailableDeliveries();
      } else {
        _availableOrders = [];
      }
    } catch (_) {}
    notifyListeners();
  }

  // Load available deliveries
  Future<void> loadAvailableDeliveries() async {
    if (!_isOnline) return;
    _isLoading = true;
    notifyListeners();

    try {
      _availableOrders = await _supabaseService.getAvailableOrders();
    } catch (_) {}

    _isLoading = false;
    notifyListeners();
  }

  // Check for existing active delivery
  Future<void> checkActiveDelivery(String driverId) async {
    try {
      _activeOrder = await _supabaseService.getActiveOrder(driverId);
      if (_activeOrder != null && _activeOrder!.status == 'OUT_FOR_DELIVERY') {
        _startGpsStream(driverId, _activeOrder!.id);
      }
      notifyListeners();
    } catch (_) {}
  }

  // Accept a Delivery
  Future<bool> acceptDelivery(OrderModel order, String driverId) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _supabaseService.updateOrderStatus(
        orderId: order.id,
        newStatus: 'DRIVER_ASSIGNED',
        driverId: driverId,
      );
      order.status = 'DRIVER_ASSIGNED';
      _activeOrder = order;
      _availableOrders.removeWhere((o) => o.id == order.id);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _statusMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Advance Order Lifecycle
  Future<bool> advanceActiveOrderStatus(String driverId) async {
    if (_activeOrder == null) return false;

    final currentStatus = _activeOrder!.status;
    final nextStatus = _activeOrder!.nextStatus;
    if (nextStatus == null) return false;

    _isLoading = true;
    notifyListeners();

    try {
      await _supabaseService.updateOrderStatus(
        orderId: _activeOrder!.id,
        newStatus: nextStatus,
        driverId: driverId,
      );

      _activeOrder!.status = nextStatus;

      // If entered OUT_FOR_DELIVERY, start broadcasting live GPS
      if (nextStatus == 'OUT_FOR_DELIVERY') {
        _startGpsStream(driverId, _activeOrder!.id);
      } else if (nextStatus == 'DELIVERED') {
        _stopGpsStream();
        _deliveryHistory.insert(0, _activeOrder!);
        _activeOrder = null;
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _statusMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void _startGpsStream(String driverId, String orderId) {
    _locationService.startDeliveryTracking(
      onLocationUpdate: (lat, lng) {
        _supabaseService.broadcastLocation(
          driverId: driverId,
          orderId: orderId,
          latitude: lat,
          longitude: lng,
        );
      },
    );
  }

  void _stopGpsStream() {
    _locationService.stopDeliveryTracking();
  }

  // Load Past Deliveries
  Future<void> loadDeliveryHistory(String driverId) async {
    try {
      _deliveryHistory = await _supabaseService.getDeliveryHistory(driverId);
      notifyListeners();
    } catch (_) {}
  }
}
