import 'package:flutter/foundation.dart';

/// AppProvider - State management for Trimix Premium
/// Manages global app state including current tab selection and user preferences
class AppProvider extends ChangeNotifier {
  int _currentTabIndex = 0;
  bool _isPremiumUser = true;
  String _userName = 'Premium User';

  /// Getters
  int get currentTabIndex => _currentTabIndex;
  bool get isPremiumUser => _isPremiumUser;
  String get userName => _userName;

  /// Update current tab index for BottomNavigationBar
  void setTabIndex(int index) {
    _currentTabIndex = index;
    notifyListeners();
  }

  /// Update premium status
  void setPremiumStatus(bool status) {
    _isPremiumUser = status;
    notifyListeners();
  }

  /// Update user name
  void setUserName(String name) {
    _userName = name;
    notifyListeners();
  }

  /// Reset app state
  void resetAppState() {
    _currentTabIndex = 0;
    _isPremiumUser = true;
    _userName = 'Premium User';
    notifyListeners();
  }
}
