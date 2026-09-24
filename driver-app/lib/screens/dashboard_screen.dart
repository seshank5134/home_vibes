import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/delivery_provider.dart';
import '../widgets/nearby_order_alert.dart';
import 'active_delivery_screen.dart';
import 'delivery_history_screen.dart';
import 'profile_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  bool _alertOpen = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.driver != null) {
        final delivery = context.read<DeliveryProvider>();
        delivery.checkActiveDelivery(auth.driver!.id);
        if (delivery.isOnline) {
          delivery.loadAvailableDeliveries();
        }
      }
      // Listen for incoming assignments and pop the alert sheet.
      context.read<DeliveryProvider>().addListener(_onDeliveryProviderChange);
    });
  }

  @override
  void dispose() {
    context.read<DeliveryProvider>().removeListener(_onDeliveryProviderChange);
    super.dispose();
  }

  void _onDeliveryProviderChange() {
    final delivery = context.read<DeliveryProvider>();
    if (delivery.hasPendingAssignment && !_alertOpen) {
      _alertOpen = true;
      showModalBottomSheet<void>(
        context: context,
        isDismissible: false,
        enableDrag: false,
        backgroundColor: Colors.transparent,
        builder: (_) => const NearbyOrderAlertSheet(),
      ).whenComplete(() => _alertOpen = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      const _DeliveriesTab(),
      const DeliveryHistoryScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0F172A),
          border: Border(top: BorderSide(color: Color(0x1AFFFFFF))),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          backgroundColor: Colors.transparent,
          selectedItemColor: const Color(0xFFFF5E36),
          unselectedItemColor: const Color(0xFF64748B),
          elevation: 0,
          onTap: (index) => setState(() => _currentIndex = index),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.delivery_dining_rounded),
              label: 'Deliveries',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.history_rounded),
              label: 'History',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline_rounded),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}

class _DeliveriesTab extends StatelessWidget {
  const _DeliveriesTab();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final delivery = context.watch<DeliveryProvider>();
    final driver = auth.driver;

    if (driver == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () async {
          await delivery.checkActiveDelivery(driver.id);
          if (delivery.isOnline) {
            await delivery.loadAvailableDeliveries();
          }
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Driver Card & Online Switch
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF161E31),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0x1AFFFFFF)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 26,
                      backgroundColor: const Color(0xFFFF5E36),
                      child: Text(
                        driver.name.isNotEmpty ? driver.name[0] : 'D',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            driver.name,
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${driver.vehicleType} (${driver.vehicleNumber})',
                            style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                          ),
                        ],
                      ),
                    ),
                    // Online/Offline Switch
                    Column(
                      children: [
                        Transform.scale(
                          scale: 0.85,
                          child: Switch(
                            value: delivery.isOnline,
                            activeTrackColor: const Color(0xFF10B981),
                            onChanged: (_) {
                              delivery.toggleOnline(driver.id);
                              auth.updateDriverOnlineStatus(!delivery.isOnline);
                            },
                          ),
                        ),
                        Text(
                          delivery.isOnline ? 'ONLINE' : 'OFFLINE',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: delivery.isOnline ? const Color(0xFF10B981) : const Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // KPI Stats Grid
              Row(
                children: [
                  Expanded(
                    child: _buildMetricCard(
                      title: "Today's Trips",
                      value: "${delivery.deliveryHistory.length}",
                      icon: Icons.check_circle_outline,
                      color: const Color(0xFF10B981),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricCard(
                      title: "Driver Rating",
                      value: "⭐ ${driver.rating.toStringAsFixed(1)}",
                      icon: Icons.star_outline,
                      color: const Color(0xFFF59E0B),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricCard(
                      title: "Est. Earnings",
                      value: "₹${(delivery.deliveryHistory.length * 50).toStringAsFixed(0)}",
                      icon: Icons.currency_rupee,
                      color: const Color(0xFF38BDF8),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Active Delivery Banner
              if (delivery.activeOrder != null) ...[
                const Text(
                  'ACTIVE DELIVERY IN PROGRESS',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                    color: Color(0xFFFF5E36),
                  ),
                ),
                const SizedBox(height: 8),
                InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ActiveDeliveryScreen(order: delivery.activeOrder!),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2E1A16), Color(0xFF1E293B)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFFF5E36)),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x33FF5E36),
                          blurRadius: 15,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Order #${delivery.activeOrder!.orderNumber}',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFF5E36),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                delivery.activeOrder!.status.replaceAll('_', ' '),
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 16, color: Color(0xFF94A3B8)),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                delivery.activeOrder!.deliveryAddress,
                                style: const TextStyle(fontSize: 13, color: Color(0xFFE2E8F0)),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: const [
                            Text(
                              'Open Delivery Console →',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFFF5E36),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 28),
              ],

              // Available Deliveries Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Available Deliveries',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  if (delivery.isOnline)
                    IconButton(
                      icon: const Icon(Icons.refresh, size: 20),
                      onPressed: () => delivery.loadAvailableDeliveries(),
                    ),
                ],
              ),
              const SizedBox(height: 12),

              if (!delivery.isOnline)
                _buildOfflineNotice(context, driver.id)
              else if (delivery.isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (delivery.availableOrders.isEmpty)
                _buildEmptyDeliveriesNotice()
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: delivery.availableOrders.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final order = delivery.availableOrders[index];
                    return _buildOrderCard(context, order, driver.id);
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF161E31),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
          ),
        ],
      ),
    );
  }

  Widget _buildOfflineNotice(BuildContext context, String driverId) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: const Color(0xFF161E31),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: Column(
        children: [
          const Icon(Icons.power_settings_new_rounded, size: 48, color: Color(0xFF64748B)),
          const SizedBox(height: 12),
          const Text(
            "You are currently Offline",
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          const Text(
            "Switch your status to Online above to receive delivery dispatch requests from the central kitchen.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyDeliveriesNotice() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: const Color(0xFF161E31),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: Column(
        children: const [
          Icon(Icons.checklist_rounded, size: 48, color: Color(0xFF64748B)),
          SizedBox(height: 12),
          Text(
            "No Deliveries Ready for Pickup",
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 6),
          Text(
            "Central kitchen is preparing orders. Pull down to refresh live queue.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderCard(BuildContext context, dynamic order, String driverId) {
    final delivery = context.read<DeliveryProvider>();

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Order #${order.orderNumber}',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0x2638BDF8),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'READY FOR PICKUP',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 16, color: Color(0xFF94A3B8)),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  order.deliveryAddress,
                  style: const TextStyle(fontSize: 13, color: Color(0xFFCBD5E1)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.lunch_dining_outlined, size: 16, color: Color(0xFF94A3B8)),
              const SizedBox(width: 6),
              Text(
                '${order.items.length} items • ₹${order.totalAmount.toStringAsFixed(0)} (${order.paymentMethod == "CASH_ON_DELIVERY" ? "Cash" : "Prepaid"})',
                style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () async {
                final success = await delivery.acceptDelivery(order, driverId);
                if (success && context.mounted) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ActiveDeliveryScreen(order: order),
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFF5E36),
                padding: const EdgeInsets.symmetric(vertical: 10),
              ),
              child: const Text('Accept Delivery (Earn ₹50)'),
            ),
          ),
        ],
      ),
    );
  }
}
