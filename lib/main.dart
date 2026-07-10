import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'features/home_screen.dart';
import 'providers/app_provider.dart';

void main() {
  runApp(const TrimixPremiumApp());
}

/// Main application entry point for Trimix Premium
/// All-in-one Advance App with Video Editing + Photo Editing + AI Reel Maker + AI Caption + AI Voices
class TrimixPremiumApp extends StatelessWidget {
  const TrimixPremiumApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
      ],
      child: MaterialApp(
        title: 'Trimix Premium',
        debugShowCheckedModeBanner: false,
        theme: _buildTheme(),
        home: const HomeScreen(),
      ),
    );
  }

  /// Build Material 3 theme with Dark Background #0A0A0A and Gold #FFD700
  static ThemeData _buildTheme() {
    const Color darkBg = Color(0xFF0A0A0A);
    const Color goldPrimary = Color(0xFFFFD700);
    const Color surfaceColor = Color(0xFF1A1A1A);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBg,
      primaryColor: goldPrimary,
      
      // ColorScheme for Material 3
      colorScheme: const ColorScheme.dark(
        primary: goldPrimary,
        secondary: Color(0xFFFFA500),
        surface: surfaceColor,
        background: darkBg,
        onBackground: Colors.white,
        onSurface: Colors.white,
      ),

      // Text Themes using Google Fonts
      textTheme: GoogleFonts.poppinsTextTheme(
        ThemeData.dark().textTheme,
      ).apply(
        bodyColor: Colors.white,
        displayColor: Colors.white,
      ),

      // AppBar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: darkBg,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: goldPrimary,
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
      ),

      // Card Theme with Glassmorphic style
      cardTheme: CardTheme(
        color: surfaceColor,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(
            color: Colors.white24,
            width: 1,
          ),
        ),
      ),

      // BottomNavigationBar Theme
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surfaceColor,
        selectedItemColor: goldPrimary,
        unselectedItemColor: Colors.grey,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),

      // Button Themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: goldPrimary,
          foregroundColor: Colors.black,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        ),
      ),
    );
  }
}
