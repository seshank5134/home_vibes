import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final driver = auth.driver;

    if (driver == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Avatar & Name Card
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 44,
                    backgroundColor: const Color(0xFFFF5E36),
                    child: Text(
                      driver.name.isNotEmpty ? driver.name[0] : 'D',
                      style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    driver.name,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    driver.email,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0x2610B981),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0x6610B981)),
                    ),
                    child: const Text(
                      '⭐ Verified Fleet Partner',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Profile Details List
            _buildDetailTile(
              icon: Icons.phone_outlined,
              label: 'Phone Number',
              value: driver.phone,
            ),
            const SizedBox(height: 12),
            _buildDetailTile(
              icon: Icons.two_wheeler_outlined,
              label: 'Vehicle Model & Mode',
              value: driver.vehicleType,
            ),
            const SizedBox(height: 12),
            _buildDetailTile(
              icon: Icons.badge_outlined,
              label: 'License Plate / Registration',
              value: driver.vehicleNumber,
            ),
            const SizedBox(height: 12),
            _buildDetailTile(
              icon: Icons.local_shipping_outlined,
              label: 'Lifetime Completed Orders',
              value: '${driver.totalDeliveries} Deliveries',
            ),
            const SizedBox(height: 32),

            // Cloud Computing viva note
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF161E31),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0x1AFFFFFF)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Cloud Architecture Role',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8)),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'This Flutter Android edge client connects to Supabase PostgreSQL over WebSockets (Realtime) and streams GPS telemetry to the driver_locations table every 5-10s during delivery trips.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Sign Out Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  await auth.logout();
                  if (context.mounted) {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (route) => false,
                    );
                  }
                },
                icon: const Icon(Icons.logout, size: 18, color: Color(0xFFEF4444)),
                label: const Text(
                  'Sign Out from Fleet',
                  style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w600),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0x66EF4444)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailTile({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF161E31),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF94A3B8), size: 20),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }
}
