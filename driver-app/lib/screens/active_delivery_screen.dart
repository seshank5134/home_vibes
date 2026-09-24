import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/order_model.dart';
import '../providers/auth_provider.dart';
import '../providers/delivery_provider.dart';

class ActiveDeliveryScreen extends StatelessWidget {
  final OrderModel order;

  const ActiveDeliveryScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final delivery = context.watch<DeliveryProvider>();
    final driver = auth.driver;

    final currentOrder = delivery.activeOrder ?? order;
    final status = currentOrder.status;

    return Scaffold(
      appBar: AppBar(
        title: Text('Order #${currentOrder.orderNumber}'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0x33FF5E36),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFFF5E36)),
            ),
            child: Center(
              child: Text(
                status.replaceAll('_', ' '),
                style: const TextStyle(
                  color: Color(0xFFFF5E36),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // GPS Live Telemetry Indicator
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: status == 'OUT_FOR_DELIVERY'
                    ? const Color(0x1F10B981)
                    : const Color(0x1F38BDF8),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: status == 'OUT_FOR_DELIVERY'
                      ? const Color(0x4D10B981)
                      : const Color(0x4D38BDF8),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: status == 'OUT_FOR_DELIVERY'
                          ? const Color(0xFF10B981)
                          : const Color(0xFF38BDF8),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          status == 'OUT_FOR_DELIVERY'
                              ? 'LIVE GPS STREAMING ACTIVE'
                              : 'GPS Telemetry Ready',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: status == 'OUT_FOR_DELIVERY'
                                ? const Color(0xFF10B981)
                                : const Color(0xFF38BDF8),
                          ),
                        ),
                        Text(
                          status == 'OUT_FOR_DELIVERY'
                              ? 'Broadcasting coordinates to customer map via Supabase Realtime'
                              : 'Location tracking starts automatically once food is picked up',
                          style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Step Progress Checklist
            _buildStatusTimeline(status),
            const SizedBox(height: 24),

            // Pickup Kitchen Card
            _buildLocationCard(
              title: 'PICKUP KITCHEN',
              name: 'HomeVibes Central Kitchen',
              address: 'Brigade Road, Central Hub, Bengaluru, KA 560001',
              icon: Icons.storefront_rounded,
              color: const Color(0xFFF59E0B),
              isPassed: status != 'DRIVER_ASSIGNED',
            ),
            const SizedBox(height: 14),

            // Dropoff Customer Card
            _buildLocationCard(
              title: 'DELIVER TO CUSTOMER',
              name: currentOrder.customerName ?? 'Customer',
              address: currentOrder.deliveryAddress,
              phone: currentOrder.customerPhone,
              icon: Icons.home_rounded,
              color: const Color(0xFF10B981),
              isPassed: false,
            ),
            const SizedBox(height: 20),

            // Order Items & Notes Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF161E31),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0x1AFFFFFF)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Order Contents',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  if (currentOrder.items.isNotEmpty)
                    ...currentOrder.items.map((i) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${i.quantity}x ${i.name}',
                                style: const TextStyle(fontSize: 13, color: Color(0xFFCBD5E1)),
                              ),
                              Text(
                                '\$${i.totalPrice.toStringAsFixed(2)}',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ))
                  else
                    const Text('1x Gourmet Feast Platter', style: TextStyle(color: Color(0xFF94A3B8))),
                  const Divider(color: Color(0x1AFFFFFF), height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total Collectible:',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        currentOrder.paymentMethod == 'CASH_ON_DELIVERY'
                            ? '\$${currentOrder.totalAmount.toStringAsFixed(2)} (Cash)'
                            : 'PAID (Online)',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: currentOrder.paymentMethod == 'CASH_ON_DELIVERY'
                              ? const Color(0xFFF59E0B)
                              : const Color(0xFF10B981),
                        ),
                      ),
                    ],
                  ),
                  if (currentOrder.deliveryNotes != null && currentOrder.deliveryNotes!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Note: ${currentOrder.deliveryNotes}',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8), fontStyle: FontStyle.italic),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Giant Forward Status Action Button
            if (currentOrder.nextActionLabel != null)
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: delivery.isLoading || driver == null
                      ? null
                      : () async {
                          final success = await delivery.advanceActiveOrderStatus(driver.id);
                          if (success && currentOrder.status == 'DELIVERED' && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('🎉 Delivery successfully marked as completed!'),
                                backgroundColor: Color(0xFF10B981),
                              ),
                            );
                            Navigator.pop(context);
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF5E36),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: delivery.isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          currentOrder.nextActionLabel!,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusTimeline(String currentStatus) {
    final steps = ['DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    final labels = ['Assigned', 'Picked Up', 'On The Way', 'Delivered'];

    final currentIndex = steps.indexOf(currentStatus);

    return Row(
      children: List.generate(steps.length, (index) {
        final isPassed = index <= currentIndex;
        final isCurrent = index == currentIndex;

        return Expanded(
          child: Column(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isPassed ? const Color(0xFFFF5E36) : const Color(0xFF1E293B),
                  border: Border.all(
                    color: isCurrent ? Colors.white : Colors.transparent,
                    width: 2,
                  ),
                ),
                child: Center(
                  child: isPassed && !isCurrent
                      ? const Icon(Icons.check, size: 16, color: Colors.white)
                      : Text(
                          '${index + 1}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isPassed ? Colors.white : const Color(0xFF64748B),
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                labels[index],
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                  color: isPassed ? Colors.white : const Color(0xFF64748B),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildLocationCard({
    required String title,
    required String name,
    required String address,
    String? phone,
    required IconData icon,
    required Color color,
    required bool isPassed,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161E31),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 18),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                  color: color,
                ),
              ),
              if (isPassed) ...[
                const Spacer(),
                const Text(
                  'COMPLETED',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                ),
              ],
            ],
          ),
          const SizedBox(height: 10),
          Text(name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(address, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
          if (phone != null) ...[
            const SizedBox(height: 8),
            Text('📞 $phone', style: const TextStyle(fontSize: 12, color: Color(0xFF38BDF8))),
          ],
        ],
      ),
    );
  }
}
