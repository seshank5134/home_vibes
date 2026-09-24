import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/delivery_provider.dart';
import '../providers/auth_provider.dart';

/// Bottom sheet alert shown when the engine assigns a nearby order to this driver.
/// Auto-dismisses after 3 minutes (countdown visible to the driver).
class NearbyOrderAlertSheet extends StatelessWidget {
  const NearbyOrderAlertSheet({super.key});

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<DeliveryProvider, AuthProvider>(
      builder: (ctx, delivery, auth, _) {
        final assignment = delivery.pendingAssignment;
        if (assignment == null) return const SizedBox.shrink();

        final seconds = delivery.timeoutSecondsRemaining;
        final fraction = seconds / 180.0;

        final distanceKm =
            (assignment['distance_km'] as num?)?.toDouble() ?? 0.0;
        final address =
            assignment['delivery_address'] as String? ?? 'Unknown';
        final orderNumber =
            assignment['order_number'] as String? ?? 'HV-000000';
        final amount =
            (assignment['total_amount'] as num?)?.toDouble() ?? 0.0;
        final isBatch = assignment['is_batch'] == true;

        return Material(
          color: Colors.transparent,
          child: Container(
            decoration: const BoxDecoration(
              color: Color(0xFF1C1C1E),
              borderRadius:
                  BorderRadius.vertical(top: Radius.circular(20)),
              boxShadow: [
                BoxShadow(
                  color: Color(0x73000000),
                  blurRadius: 20,
                  offset: Offset(0, -4),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 36, height: 4,
                        decoration: BoxDecoration(
                          color: const Color(0xFF48484A),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        SizedBox(
                          width: 52, height: 52,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              CircularProgressIndicator(
                                value: fraction.clamp(0.0, 1.0),
                                strokeWidth: 4,
                                backgroundColor: const Color(0xFF3A3A3C),
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  fraction > 0.4
                                      ? const Color(0xFF34C759)
                                      : const Color(0xFFFF9F0A),
                                ),
                              ),
                              Text(
                                _formatTime(seconds),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Text(
                                    'New Order',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w700,
                                      fontFamily: 'Inter',
                                    ),
                                  ),
                                  if (isBatch) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0x330A84FF),
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(
                                          color: const Color(0xFF0A84FF),
                                          width: 0.8,
                                        ),
                                      ),
                                      child: const Text(
                                        'BATCH',
                                        style: TextStyle(
                                          color: Color(0xFF0A84FF),
                                          fontSize: 10,
                                          fontWeight: FontWeight.w700,
                                          letterSpacing: 0.8,
                                          fontFamily: 'Inter',
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              Text(
                                orderNumber,
                                style: const TextStyle(
                                  color: Color(0xFF8E8E93),
                                  fontSize: 13,
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    const Divider(color: Color(0xFF3A3A3C)),
                    const SizedBox(height: 16),
                    _DetailRow(
                      label: 'Distance',
                      value: '${distanceKm.toStringAsFixed(1)} km',
                    ),
                    const SizedBox(height: 10),
                    _DetailRow(label: 'Deliver to', value: address),
                    const SizedBox(height: 10),
                    _DetailRow(
                      label: 'Amount',
                      value: '₹${amount.toStringAsFixed(0)}',
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () async {
                              final driverId = auth.driver?.id ?? '';
                              await delivery.declineAssignment(driverId);
                              if (context.mounted) Navigator.of(context).pop();
                            },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF8E8E93),
                              side: const BorderSide(
                                  color: Color(0xFF3A3A3C), width: 1.2),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              padding:
                                  const EdgeInsets.symmetric(vertical: 14),
                            ),
                            child: const Text(
                              'Decline',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 2,
                          child: ElevatedButton(
                            onPressed: delivery.isLoading
                                ? null
                                : () async {
                                    final driverId = auth.driver?.id ?? '';
                                    final ok = await delivery
                                        .acceptAssignment(driverId);
                                    if (context.mounted) {
                                      Navigator.of(context).pop();
                                      if (!ok) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          const SnackBar(
                                            content: Text(
                                              'Could not accept - order may have been reassigned.',
                                            ),
                                            backgroundColor: Color(0xFFFF453A),
                                          ),
                                        );
                                      }
                                    }
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF34C759),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              padding:
                                  const EdgeInsets.symmetric(vertical: 14),
                              elevation: 0,
                            ),
                            child: delivery.isLoading
                                ? const SizedBox(
                                    width: 20, height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text(
                                    'Accept Order',
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontWeight: FontWeight.w700,
                                      fontSize: 15,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            label,
            style: const TextStyle(
              color: Color(0xFF8E8E93),
              fontSize: 13,
              fontFamily: 'Inter',
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w500,
              fontFamily: 'Inter',
            ),
          ),
        ),
      ],
    );
  }
}
