import 'package:flutter/material.dart';
import '../models/driver_model.dart';
import '../services/supabase_service.dart';

class AuthProvider extends ChangeNotifier {
  final SupabaseService _supabaseService = SupabaseService();

  DriverModel? _driver;
  bool _isLoading = false;
  String? _errorMessage;

  DriverModel? get driver => _driver;
  bool get isAuthenticated => _driver != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final loggedInDriver = await _supabaseService.signIn(email, password);
      if (loggedInDriver != null) {
        _driver = loggedInDriver;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = 'Invalid email or password.';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _supabaseService.signOut();
    _driver = null;
    notifyListeners();
  }

  void updateDriverOnlineStatus(bool online) {
    if (_driver != null) {
      _driver = _driver!.copyWith(isOnline: online);
      notifyListeners();
    }
  }
}
