class OrderItemModel {
  final String id;
  final String name;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  OrderItemModel({
    required this.id,
    required this.name,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id']?.toString() ?? '',
      name: json['food_items'] != null ? json['food_items']['name'] ?? 'Delicacy' : (json['name'] ?? 'Delicacy'),
      quantity: json['quantity'] is int ? json['quantity'] : int.tryParse(json['quantity']?.toString() ?? '1') ?? 1,
      unitPrice: (json['unit_price'] as num?)?.toDouble() ?? 0.0,
      totalPrice: (json['total_price'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class OrderModel {
  final String id;
  final String orderNumber;
  final String customerId;
  final String? customerName;
  final String? customerPhone;
  final String? driverId;
  String status;
  final double subtotal;
  final double deliveryFee;
  final double totalAmount;
  final String deliveryAddress;
  final double deliveryLatitude;
  final double deliveryLongitude;
  final String paymentMethod;
  final String paymentStatus;
  final String? deliveryNotes;
  final DateTime createdAt;
  final List<OrderItemModel> items;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.customerId,
    this.customerName,
    this.customerPhone,
    this.driverId,
    required this.status,
    required this.subtotal,
    required this.deliveryFee,
    required this.totalAmount,
    required this.deliveryAddress,
    required this.deliveryLatitude,
    required this.deliveryLongitude,
    required this.paymentMethod,
    required this.paymentStatus,
    this.deliveryNotes,
    required this.createdAt,
    this.items = const [],
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    var rawItems = json['order_items'] as List<dynamic>? ?? [];
    List<OrderItemModel> parsedItems = rawItems.map((i) => OrderItemModel.fromJson(i as Map<String, dynamic>)).toList();

    return OrderModel(
      id: json['id']?.toString() ?? '',
      orderNumber: json['order_number'] ?? 'HV-UNKNOWN',
      customerId: json['customer_id']?.toString() ?? '',
      customerName: json['profiles'] != null ? json['profiles']['name'] : 'Customer',
      customerPhone: json['profiles'] != null ? json['profiles']['phone'] : '+91 98765 43212',
      driverId: json['driver_id']?.toString(),
      status: json['status'] ?? 'PLACED',
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      deliveryFee: (json['delivery_fee'] as num?)?.toDouble() ?? 2.50,
      totalAmount: (json['total_amount'] as num?)?.toDouble() ?? 0.0,
      deliveryAddress: json['delivery_address'] ?? 'Customer Address',
      deliveryLatitude: (json['delivery_latitude'] as num?)?.toDouble() ?? 12.9784,
      deliveryLongitude: (json['delivery_longitude'] as num?)?.toDouble() ?? 77.6408,
      paymentMethod: json['payment_method'] ?? 'CASH_ON_DELIVERY',
      paymentStatus: json['payment_status'] ?? 'PENDING',
      deliveryNotes: json['delivery_notes'],
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) ?? DateTime.now() : DateTime.now(),
      items: parsedItems,
    );
  }

  // Delivery status transition state helpers
  bool get isReadyForPickup => status == 'READY_FOR_PICKUP';
  bool get isDriverAssigned => status == 'DRIVER_ASSIGNED';
  bool get isPickedUp => status == 'PICKED_UP';
  bool get isOutForDelivery => status == 'OUT_FOR_DELIVERY';
  bool get isDelivered => status == 'DELIVERED';
  bool get isCancelled => status == 'CANCELLED';

  String? get nextActionLabel {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return 'Accept Delivery';
      case 'DRIVER_ASSIGNED':
        return 'Arrived at Kitchen & Pick Up';
      case 'PICKED_UP':
        return 'Start Trip to Customer';
      case 'OUT_FOR_DELIVERY':
        return 'Complete Delivery';
      default:
        return null;
    }
  }

  String? get nextStatus {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return 'DRIVER_ASSIGNED';
      case 'DRIVER_ASSIGNED':
        return 'PICKED_UP';
      case 'PICKED_UP':
        return 'OUT_FOR_DELIVERY';
      case 'OUT_FOR_DELIVERY':
        return 'DELIVERED';
      default:
        return null;
    }
  }
}
