import 'dart:async';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/order_model.dart';
import '../services/supabase_service.dart';
import '../services/location_service.dart';

const Duration _assignmentTimeout = Duration(minutes: 3);

class DeliveryProvider extends ChangeNotifier {
  final SupabaseService _supabaseService = SupabaseService();
  final LocationService _locationService = LocationService();

  bool _isOnline = false;
  bool _isLoading = false;
  OrderModel? _activeOrder;
  List<OrderModel> _availableOrders = [];
  List<OrderModel> _deliveryHistory = [];
  String? _statusMessage;

  Map<String, dynamic>? _pendingAssignment;
  Timer? _assignmentTimer;
  int _timeoutSecondsRemaining = 0;
  RealtimeChannel? _assignmentChannel;

  bool get isOnline => _isOnline;
  bool get isLoading => _isLoading;
  OrderModel? get activeOrder => _activeOrder;
  List<OrderModel> get availableOrders => _availableOrders;
  List<OrderModel> get deliveryHistory => _deliveryHistory;
  String? get statusMessage => _statusMessage;
  Map<String, dynamic>? get pendingAssignment => _pendingAssignment;
  int get timeoutSecondsRemaining => _timeoutSecondsRemaining;
  bool get hasPendingAssignment => _pendingAssignment != null;

  Future<void> toggleOnline(String driverId) async {
    _isOnline = !_isOnline;
    notifyListeners();
    try {
      await _supabaseService.setOnlineStatus(driverId, _isOnline);
      if (_isOnline) {
        _startAssignmentListener(driverId);
        await loadAvailableDeliveries();
      } else {
        _stopAssignmentListener();
        _clearPendingAssignment();
        _availableOrders = [];
      }
    } catch (_) {}
    notifyListeners();
  }

  void _startAssignmentListener(String driverId) {
    _stopAssignmentListener();
    _assignmentChannel = _supabaseService.subscribeToAssignments(
      driverId: driverId,
      onAssignment: (assignment) => _setPendingAssignment(assignment, driverId),
    );
  }

  void _stopAssignmentListener() {
    _assignmentChannel?.unsubscribe();
    _assignmentChannel = null;
  }

  void _setPendingAssignment(Map<String, dynamic> assignment, String driverId) {
    _pendingAssignment = assignment;
    _timeoutSecondsRemaining = _assignmentTimeout.inSeconds;
    _assignmentTimer?.cancel();
    _assignmentTimer = Timer.periodic(const Duration(seconds: 1), (t) async {
      _timeoutSecondsRemaining--;
      notifyListeners();
      if (_timeoutSecondsRemaining <= 0) {
        t.cancel();
        await _autoDecline(assignment['id'] as String, driverId);
      }
    });
    notifyListeners();
  }

  void _clearPendingAssignment() {
    _assignmentTimer?.cancel();
    _assignmentTimer = null;
    _pendingAssignment = null;
    _timeoutSecondsRemaining = 0;
  }

  Future<void> _autoDecline(String assignmentId, String driverId) async {
    await _supabaseService.respondToAssignment(
      assignmentId: assignmentId,
      driverId: driverId,
      accept: false,
    );
    _clearPendingAssignment();
    notifyListeners();
  }

  Future<bool> acceptAssignment(String driverId) async {
    final assignment = _pendingAssignment;
    if (assignment == null) return false;
    _assignmentTimer?.cancel();
    _isLoading = true;
    notifyListeners();

    final success = await _supabaseService.respondToAssignment(
      assignmentId: assignment['id'] as String,
      driverId: driverId,
      accept: true,
    );

    if (success) {
      _activeOrder = await _supabaseService.getActiveOrder(driverId) ??
          OrderModel(
            id: assignment['order_id'] as String? ?? '',
            orderNumber: assignment['order_number'] as String? ?? 'HV-000000',
            customerId: '',
            status: 'DRIVER_ASSIGNED',
            subtotal: (assignment['subtotal'] as num?)?.toDouble() ?? 0.0,
            deliveryFee: (assignment['delivery_fee'] as num?)?.toDouble() ?? 0.0,
            totalAmount: (assignment['total_amount'] as num?)?.toDouble() ?? 0.0,
            deliveryAddress: assignment['delivery_address'] as String? ?? '',
            deliveryLatitude: (assignment['delivery_latitude'] as num?)?.toDouble() ?? 0.0,
            deliveryLongitude: (assignment['delivery_longitude'] as num?)?.toDouble() ?? 0.0,
            paymentMethod: assignment['payment_method'] as String? ?? 'UPI',
            paymentStatus: assignment['payment_status'] as String? ?? 'PAID',
            createdAt: DateTime.now(),
          );
    }

    _clearPendingAssignment();
    _isLoading = false;
    notifyListeners();
    return success;
  }

  Future<void> declineAssignment(String driverId) async {
    final assignment = _pendingAssignment;
    if (assignment == null) return;
    _assignmentTimer?.cancel();
    await _supabaseService.respondToAssignment(
      assignmentId: assignment['id'] as String,
      driverId: driverId,
      accept: false,
    );
    _clearPendingAssignment();
    notifyListeners();
  }

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

  Future<void> checkActiveDelivery(String driverId) async {
    try {
      _activeOrder = await _supabaseService.getActiveOrder(driverId);
      if (_activeOrder != null && _activeOrder!.status == 'OUT_FOR_DELIVERY') {
        _startGpsStream(driverId, _activeOrder!.id);
      }
      notifyListeners();
    } catch (_) {}
  }

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

  Future<bool> advanceActiveOrderStatus(String driverId) async {
    if (_activeOrder == null) return false;
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
        _supabaseService.broadcastLocationFull(
          driverId: driverId,
          orderId: orderId,
          latitude: lat,
          longitude: lng,
          isAvailable: false,
        );
      },
    );
  }

  void _stopGpsStream() {
    _locationService.stopDeliveryTracking();
  }

  Future<void> loadDeliveryHistory(String driverId) async {
    try {
      _deliveryHistory = await _supabaseService.getDeliveryHistory(driverId);
      notifyListeners();
    } catch (_) {}
  }

  @override
  void dispose() {
    _stopAssignmentListener();
    _assignmentTimer?.cancel();
    super.dispose();
  }
}
