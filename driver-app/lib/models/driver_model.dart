class DriverModel {
  final String id;
  final String userId;
  final String name;
  final String email;
  final String phone;
  final String vehicleType;
  final String vehicleNumber;
  final bool isOnline;
  final double? currentLatitude;
  final double? currentLongitude;
  final double rating;
  final int totalDeliveries;

  DriverModel({
    required this.id,
    required this.userId,
    required this.name,
    required this.email,
    required this.phone,
    required this.vehicleType,
    required this.vehicleNumber,
    required this.isOnline,
    this.currentLatitude,
    this.currentLongitude,
    required this.rating,
    required this.totalDeliveries,
  });

  factory DriverModel.fromJson(Map<String, dynamic> json, {Map<String, dynamic>? profileJson}) {
    return DriverModel(
      id: json['id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      name: profileJson?['name'] ?? 'Ravi Kumar (Speedy Driver)',
      email: profileJson?['email'] ?? 'driver@homevibes.com',
      phone: profileJson?['phone'] ?? '+91 98765 43211',
      vehicleType: json['vehicle_type'] ?? 'Electric Scooter',
      vehicleNumber: json['vehicle_number'] ?? 'KA-01-HV-2026',
      isOnline: json['is_online'] ?? false,
      currentLatitude: (json['current_latitude'] as num?)?.toDouble(),
      currentLongitude: (json['current_longitude'] as num?)?.toDouble(),
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      totalDeliveries: json['total_deliveries'] is int
          ? json['total_deliveries']
          : int.tryParse(json['total_deliveries']?.toString() ?? '0') ?? 0,
    );
  }

  DriverModel copyWith({
    bool? isOnline,
    double? currentLatitude,
    double? currentLongitude,
    int? totalDeliveries,
  }) {
    return DriverModel(
      id: id,
      userId: userId,
      name: name,
      email: email,
      phone: phone,
      vehicleType: vehicleType,
      vehicleNumber: vehicleNumber,
      isOnline: isOnline ?? this.isOnline,
      currentLatitude: currentLatitude ?? this.currentLatitude,
      currentLongitude: currentLongitude ?? this.currentLongitude,
      rating: rating,
      totalDeliveries: totalDeliveries ?? this.totalDeliveries,
    );
  }
}
