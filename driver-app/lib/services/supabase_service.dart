import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/order_model.dart';
import '../models/driver_model.dart';

class SupabaseService {
  static final SupabaseService _instance = SupabaseService._internal();
  factory SupabaseService() => _instance;
  SupabaseService._internal();

  SupabaseClient? _client;
  bool _isLive = false;

  bool get isLive => _isLive;
  SupabaseClient? get client => _client;

  Future<void> initialize() async {
    try {
      final configString = await rootBundle.loadString('assets/config/env.json');
      final config = jsonDecode(configString) as Map<String, dynamic>;
      final url = config['supabaseUrl'] as String?;
      final anonKey = config['supabaseAnonKey'] as String?;

      if (url != null && anonKey != null && !url.contains('your-project-ref')) {
        await Supabase.initialize(
          url: url,
          anonKey: anonKey,
        );
        _client = Supabase.instance.client;
        _isLive = true;
      }
    } catch (_) {
      _isLive = false;
    }
  }

  // Auth
  Future<DriverModel?> signIn(String email, String password) async {
    if (_isLive && _client != null) {
      final res = await _client!.auth.signInWithPassword(
        email: email,
        password: password,
      );
      if (res.user != null) {
        return getDriverProfile(res.user!.id);
      }
      return null;
    }

    // Mock Login for local testing
    return DriverModel(
      id: 'd2222222-bbbb-2222-bbbb-222222222222',
      userId: 'd2222222-bbbb-2222-bbbb-222222222222',
      name: 'Ravi Kumar (Speedy Driver)',
      email: email.isNotEmpty ? email : 'driver@homevibes.com',
      phone: '+91 98765 43211',
      vehicleType: 'Electric Scooter',
      vehicleNumber: 'KA-01-HV-2026',
      isOnline: true,
      currentLatitude: 12.9716,
      currentLongitude: 77.5946,
      rating: 4.96,
      totalDeliveries: 48,
    );
  }

  Future<void> signOut() async {
    if (_isLive && _client != null) {
      await _client!.auth.signOut();
    }
  }

  // Profile
  Future<DriverModel?> getDriverProfile(String userId) async {
    if (_isLive && _client != null) {
      final profileRes = await _client!.from('profiles').select().eq('id', userId).single();
      final driverRes = await _client!.from('drivers').select().eq('user_id', userId).single();
      return DriverModel.fromJson(driverRes, profileJson: profileRes);
    }
    return null;
  }

  // Toggle Online Status
  Future<void> setOnlineStatus(String driverId, bool isOnline) async {
    if (_isLive && _client != null) {
      await _client!.from('drivers').update({
        'is_online': isOnline,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', driverId);
    }
  }

  // Available Orders
  Future<List<OrderModel>> getAvailableOrders() async {
    if (_isLive && _client != null) {
      final res = await _client!
          .from('orders')
          .select('*, profiles(name, phone), order_items(*, food_items(name))')
          .eq('status', 'READY_FOR_PICKUP')
          .order('created_at', ascending: false);
      return (res as List).map((i) => OrderModel.fromJson(i)).toList();
    }

    // Mock Available Deliveries
    return [
      OrderModel(
        id: 'ord-avail-1',
        orderNumber: 'HV-892104',
        customerId: 'c3333333-cccc-3333-cccc-333333333333',
        customerName: 'Ananya Sharma',
        customerPhone: '+91 98765 43212',
        status: 'READY_FOR_PICKUP',
        subtotal: 30.49,
        deliveryFee: 2.50,
        totalAmount: 32.99,
        deliveryAddress: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',
        deliveryLatitude: 12.9784,
        deliveryLongitude: 77.6408,
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING',
        deliveryNotes: 'Please ring bell twice',
        createdAt: DateTime.now().subtract(const Duration(minutes: 10)),
        items: [
          OrderItemModel(
            id: 'item-1',
            name: 'Truffle Double Smash Burger',
            quantity: 2,
            unitPrice: 12.99,
            totalPrice: 25.98,
          ),
          OrderItemModel(
            id: 'item-2',
            name: 'Nitro Cold Brew with Sweet Cream',
            quantity: 1,
            unitPrice: 4.51,
            totalPrice: 4.51,
          ),
        ],
      )
    ];
  }

  // Active or Assigned Order
  Future<OrderModel?> getActiveOrder(String driverId) async {
    if (_isLive && _client != null) {
      final res = await _client!
          .from('orders')
          .select('*, profiles(name, phone), order_items(*, food_items(name))')
          .eq('driver_id', driverId)
          .not('status', 'in', ['DELIVERED', 'CANCELLED'])
          .order('created_at', ascending: false)
          .limit(1);
      final list = res as List;
      if (list.isNotEmpty) {
        return OrderModel.fromJson(list.first);
      }
      return null;
    }
    return null;
  }

  // Update Status Transition
  Future<void> updateOrderStatus({
    required String orderId,
    required String newStatus,
    required String driverId,
  }) async {
    if (_isLive && _client != null) {
      final Map<String, dynamic> updateData = {
        'status': newStatus,
        'updated_at': DateTime.now().toIso8601String(),
      };
      if (newStatus == 'DRIVER_ASSIGNED') {
        updateData['driver_id'] = driverId;
      }
      await _client!.from('orders').update(updateData).eq('id', orderId);
    }
  }

  // Broadcast GPS Location
  Future<void> broadcastLocation({
    required String driverId,
    required String orderId,
    required double latitude,
    required double longitude,
  }) async {
    if (_isLive && _client != null) {
      // 1. Insert into driver_locations history
      await _client!.from('driver_locations').insert({
        'driver_id': driverId,
        'order_id': orderId,
        'latitude': latitude,
        'longitude': longitude,
        'timestamp': DateTime.now().toIso8601String(),
      });

      // 2. Update current position in drivers table
      await _client!.from('drivers').update({
        'current_latitude': latitude,
        'current_longitude': longitude,
        'last_location_update': DateTime.now().toIso8601String(),
      }).eq('id', driverId);
    }
  }

  // Completed Delivery History
  Future<List<OrderModel>> getDeliveryHistory(String driverId) async {
    if (_isLive && _client != null) {
      final res = await _client!
          .from('orders')
          .select('*, profiles(name, phone), order_items(*, food_items(name))')
          .eq('driver_id', driverId)
          .eq('status', 'DELIVERED')
          .order('created_at', ascending: false);
      return (res as List).map((i) => OrderModel.fromJson(i)).toList();
    }

    return [
      OrderModel(
        id: 'hist-1',
        orderNumber: 'HV-736291',
        customerId: 'c3333333-cccc-3333-cccc-333333333333',
        status: 'DELIVERED',
        subtotal: 28.50,
        deliveryFee: 3.50,
        totalAmount: 32.00,
        deliveryAddress: 'Koramangala 4th Block, Bengaluru',
        deliveryLatitude: 12.9352,
        deliveryLongitude: 77.6245,
        paymentMethod: 'ONLINE_MOCK',
        paymentStatus: 'PAID',
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      OrderModel(
        id: 'hist-2',
        orderNumber: 'HV-645129',
        customerId: 'c3333333-cccc-3333-cccc-333333333333',
        status: 'DELIVERED',
        subtotal: 19.99,
        deliveryFee: 2.50,
        totalAmount: 22.49,
        deliveryAddress: 'Indiranagar 12th Main, Bengaluru',
        deliveryLatitude: 12.9719,
        deliveryLongitude: 77.6412,
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PAID',
        createdAt: DateTime.now().subtract(const Duration(hours: 6)),
      ),
    ];
  }
}
