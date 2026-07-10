import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// AiCaptionScreen - AI Caption, Hashtags, and Voice Generation
/// Features: Auto Captions, AI Hashtags, Social Media Description, Text to Speech with 10+ voices
/// Languages: Urdu, English, Hindi
class AiCaptionScreen extends StatefulWidget {
  const AiCaptionScreen({Key? key}) : super(key: key);

  @override
  State<AiCaptionScreen> createState() => _AiCaptionScreenState();
}

class _AiCaptionScreenState extends State<AiCaptionScreen> {
  String _selectedLanguage = 'English';
  String _selectedVoice = 'Female - Standard';
  String _selectedPlatform = 'Instagram';
  String _generatedCaption = '';
  String _generatedHashtags = '';
  bool _isGenerating = false;
  bool _isPlaying = false;

  final TextEditingController _inputController = TextEditingController();

  final List<String> _languages = ['English', 'Urdu', 'Hindi'];
  final List<String> _voices = [
    'Female - Standard',
    'Female - Soft',
    'Male - Standard',
    'Male - Deep',
    'Child - Young',
    'Female - Robotic',
    'Male - Robotic',
    'Female - British',
    'Male - American',
    'Female - Indian',
  ];
  final List<String> _platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter'];

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              _buildHeader(),
              const SizedBox(height: 24),

              // Input section
              _buildInputSection(),
              const SizedBox(height: 24),

              // Language and Platform selection
              _buildSelectionSection(),
              const SizedBox(height: 24),

              // Generate button
              _buildGenerateButton(),
              const SizedBox(height: 24),

              // Results section
              if (_generatedCaption.isNotEmpty) ...[
                _buildResultsSection(),
                const SizedBox(height: 24),

                // Voice section
                _buildVoiceSection(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  /// Build header with title
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'AI Caption & Voice',
          style: GoogleFonts.poppins(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Generate captions, hashtags, and AI voices for your content',
          style: GoogleFonts.poppins(
            fontSize: 14,
            color: Colors.grey[400],
          ),
        ),
      ],
    );
  }

  /// Build input section for text or media
  Widget _buildInputSection() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white24,
          width: 1,
        ),
        color: const Color(0xFF1A1A1A),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Input Your Content',
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _inputController,
            maxLines: 5,
            minLines: 4,
            style: GoogleFonts.poppins(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Paste video transcript, description, or any text...',
              hintStyle: GoogleFonts.poppins(color: Colors.grey[500]),
              filled: true,
              fillColor: const Color(0xFF0A0A0A),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.white24),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.white24),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: Color(0xFFFFD700),
                  width: 2,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildInputButton(
                icon: Icons.upload_file_rounded,
                label: 'Upload Video',
                onTap: () => _showFeatureNotAvailable('Upload Video'),
              ),
              _buildInputButton(
                icon: Icons.image_rounded,
                label: 'Upload Image',
                onTap: () => _showFeatureNotAvailable('Upload Image'),
              ),
              _buildInputButton(
                icon: Icons.clear_rounded,
                label: 'Clear',
                onTap: () => _inputController.clear(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Build input button
  Widget _buildInputButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Column(
      children: [
        IconButton(
          onPressed: onTap,
          icon: Icon(
            icon,
            color: const Color(0xFFFFD700),
          ),
        ),
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 10,
            color: Colors.grey[400],
          ),
        ),
      ],
    );
  }

  /// Build language and platform selection section
  Widget _buildSelectionSection() {
    return Column(
      children: [
        // Language selection
        _buildDropdownCard(
          title: 'Language',
          icon: Icons.language_rounded,
          value: _selectedLanguage,
          items: _languages,
          onChanged: (value) => setState(() => _selectedLanguage = value!),
        ),
        const SizedBox(height: 12),

        // Platform selection
        _buildDropdownCard(
          title: 'Social Platform',
          icon: Icons.share_rounded,
          value: _selectedPlatform,
          items: _platforms,
          onChanged: (value) => setState(() => _selectedPlatform = value!),
        ),
      ],
    );
  }

  /// Build dropdown card
  Widget _buildDropdownCard({
    required String title,
    required IconData icon,
    required String value,
    required List<String> items,
    required Function(String?) onChanged,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white24,
          width: 1,
        ),
        color: const Color(0xFF1A1A1A),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Icon(
            icon,
            color: const Color(0xFFFFD700),
            size: 20,
          ),
          const SizedBox(width: 12),
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const Spacer(),
          DropdownButton<String>(
            value: value,
            dropdownColor: const Color(0xFF1A1A1A),
            underline: const SizedBox(),
            onChanged: onChanged,
            items: items.map((String item) {
              return DropdownMenuItem<String>(
                value: item,
                child: Text(
                  item,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: const Color(0xFFFFD700),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  /// Build generate button
  Widget _buildGenerateButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _isGenerating || _inputController.text.isEmpty
            ? null
            : _generateCaption,
        icon: _isGenerating
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                ),
              )
            : const Icon(Icons.auto_awesome_rounded),
        label: Text(
          _isGenerating ? 'Generating...' : 'Generate Caption & Hashtags',
        ),
      ),
    );
  }

  /// Build results section with generated content
  Widget _buildResultsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Generated Content',
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: const Color(0xFFFFD700),
          ),
        ),
        const SizedBox(height: 12),

        // Caption card
        _buildContentCard(
          title: 'Caption',
          icon: Icons.description_rounded,
          content: _generatedCaption,
        ),
        const SizedBox(height: 12),

        // Hashtags card
        _buildContentCard(
          title: 'Hashtags',
          icon: Icons.tag_rounded,
          content: _generatedHashtags,
        ),
        const SizedBox(height: 12),

        // Copy buttons
        Row(
          children: [
            Expanded(
              child: _buildActionButton(
                icon: Icons.copy_rounded,
                label: 'Copy Caption',
                onTap: () => _copyToClipboard(_generatedCaption, 'Caption'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildActionButton(
                icon: Icons.copy_rounded,
                label: 'Copy Hashtags',
                onTap: () => _copyToClipboard(_generatedHashtags, 'Hashtags'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  /// Build content display card
  Widget _buildContentCard({
    required String title,
    required IconData icon,
    required String content,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white24,
          width: 1,
        ),
        color: const Color(0xFF1A1A1A),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                color: const Color(0xFFFFD700),
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            content,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: Colors.grey[300],
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  /// Build action button
  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white24,
          width: 1,
        ),
        color: const Color(0xFF1A1A1A),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  color: const Color(0xFFFFD700),
                  size: 18,
                ),
                const SizedBox(width: 8),
                Text(
                  label,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Build voice section with TTS controls
  Widget _buildVoiceSection() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white24,
          width: 1,
        ),
        color: const Color(0xFF1A1A1A),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.volume_up_rounded,
                color: const Color(0xFFFFD700),
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Text to Speech',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Voice selection dropdown
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white24),
              color: const Color(0xFF0A0A0A),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: DropdownButton<String>(
              value: _selectedVoice,
              dropdownColor: const Color(0xFF1A1A1A),
              underline: const SizedBox(),
              isExpanded: true,
              onChanged: (value) => setState(() => _selectedVoice = value!),
              items: _voices.map((String voice) {
                return DropdownMenuItem<String>(
                  value: voice,
                  child: Text(
                    voice,
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: const Color(0xFFFFD700),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),

          // Play button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isPlaying ? null : _playVoice,
              icon: Icon(_isPlaying ? Icons.stop_rounded : Icons.play_arrow_rounded),
              label: Text(_isPlaying ? 'Playing...' : 'Play Voice'),
            ),
          ),
        ],
      ),
    );
  }

  /// Generate caption and hashtags with AI
  void _generateCaption() async {
    try {
      setState(() => _isGenerating = true);

      // Simulate AI generation
      await Future.delayed(const Duration(seconds: 2));

      if (mounted) {
        setState(() {
          _isGenerating = false;
          _generatedCaption = 'Amazing content from ${_selectedPlatform}! '
              'This is perfect for sharing with your audience. '
              'Make sure to engage with your followers and build your community! 🎉';
          _generatedHashtags =
              '#${_selectedPlatform} #Content #Viral #Amazing #Creative #Trending #FYP #Explore #Engagement #FollowMe';
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Caption and hashtags generated successfully!'),
            backgroundColor: Color(0xFFFFD700),
          ),
        );
      }
    } catch (e) {
      setState(() => _isGenerating = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Play voice with TTS
  void _playVoice() async {
    try {
      setState(() => _isPlaying = true);

      // Simulate TTS playback
      await Future.delayed(const Duration(seconds: 3));

      if (mounted) {
        setState(() => _isPlaying = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Playing voice: $_selectedVoice'),
            backgroundColor: const Color(0xFFFFD700),
          ),
        );
      }
    } catch (e) {
      setState(() => _isPlaying = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Copy text to clipboard
  void _copyToClipboard(String text, String label) {
    if (text.isEmpty) return;

    // TODO: Implement actual clipboard copy
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$label copied to clipboard!'),
        backgroundColor: const Color(0xFFFFD700),
      ),
    );
  }

  /// Show feature not available message
  void _showFeatureNotAvailable(String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$feature coming soon!'),
        backgroundColor: const Color(0xFFFFD700),
      ),
    );
  }
}
