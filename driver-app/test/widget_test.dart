import 'package:flutter_test/flutter_test.dart';
import 'package:driver_app/main.dart';
import 'package:driver_app/screens/splash_screen.dart';

void main() {
  testWidgets('HomeVibes Driver App launches successfully with SplashScreen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const HomeVibesDriverApp());

    // Verify SplashScreen is loaded
    expect(find.byType(SplashScreen), findsOneWidget);
    expect(find.textContaining('Delivery Partner'), findsOneWidget);

    // Drain the bootstrap timer
    await tester.pumpAndSettle(const Duration(seconds: 2));
  });
}
