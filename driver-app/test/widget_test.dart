import 'package:flutter_test/flutter_test.dart';
import 'package:driver_app/main.dart';
import 'package:driver_app/screens/splash_screen.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() {
  testWidgets('HomeVibes Driver App launches successfully with SplashScreen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const HomeVibesDriverApp());

    // Verify SplashScreen is loaded
    expect(find.byType(SplashScreen), findsOneWidget);
    expect(find.textContaining('Delivery Fleet'), findsOneWidget);

    // Stop auto refresh timer if Supabase was initialized
    try {
      Supabase.instance.client.auth.stopAutoRefresh();
    } catch (_) {}

    await tester.pump(const Duration(milliseconds: 100));
  });
}
