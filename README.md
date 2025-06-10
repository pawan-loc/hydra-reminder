# Hydra Reminder - Chrome Extension

A beautiful and intuitive Chrome extension to help you stay hydrated throughout the day with customizable reminders and progress tracking.

## Features

### 🌊 **Hydration Tracking**
- Track daily water intake with a visual water level indicator
- Set and monitor your daily hydration goals (6-12 glasses)
- Beautiful animated interface with water drop effects

### 📊 **Progress Monitoring**
- Daily glass counter with real-time updates
- Streak tracking for consecutive days of meeting goals
- Visual progress indicators with dynamic water level display

### ⏰ **Smart Reminders**
- Customizable reminder intervals (30 minutes, 1 hour, 2 hours)
- Intelligent notifications based on your progress
- Daily reset at midnight to start fresh each day

### 🎨 **Beautiful UI**
- Modern gradient design with smooth animations
- Responsive interface optimized for Chrome extension popup
- Floating water drops and ripple effects for engaging interaction

### ⚙️ **Customizable Settings**
- Adjustable daily goals (6, 8, 10, or 12 glasses)
- Flexible reminder intervals
- Toggle notifications on/off
- Data persistence across browser sessions

## Installation

### From Chrome Web Store (Recommended)
*Coming soon - extension will be published to the Chrome Web Store*

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The Hydra Reminder icon should appear in your toolbar

## Setup

### Icon Files
**Important**: You need to replace the placeholder icon files with actual PNG images:

1. Convert `icon.svg` to PNG format using:
   - Online tools: [convertio.co](https://convertio.co), [cloudconvert.com](https://cloudconvert.com)
   - Software: GIMP, Photoshop, Inkscape, or any image editor

2. Create three PNG files:
   - `icons/icon16.png` (16×16 pixels)
   - `icons/icon48.png` (48×48 pixels)  
   - `icons/icon128.png` (128×128 pixels)

3. Replace the placeholder text files in the `icons/` folder

## Usage

### Getting Started
1. Click the Hydra Reminder icon in your Chrome toolbar
2. Set your preferred daily goal and reminder interval
3. Click "💧 Drink Water" each time you have a glass of water
4. Watch your progress fill up the water level indicator!

### Features Walkthrough

**Tracking Water Intake:**
- Click the "Drink Water" button each time you consume water
- The water level indicator fills up as you progress toward your goal
- Button text changes to encourage you as you get closer to your goal

**Managing Settings:**
- **Reminder Interval**: Choose how often you want to be reminded (30min - 2hrs)
- **Daily Goal**: Set your target number of glasses (6-12 glasses)
- **Notifications**: Enable/disable browser notifications

**Streak System:**
- Build streaks by meeting your daily goal consecutive days
- Streaks reset if you miss a day or don't meet your goal
- Track your consistency over time

## File Structure

```
hydra-reminder/
├── manifest.json          # Extension configuration
├── popup.html             # Main popup interface
├── popup.css              # Styles and animations
├── popup.js               # Popup functionality
├── background.js          # Background service worker
├── icon.svg               # SVG icon source
├── icons/                 # PNG icons folder
│   ├── icon16.png         # 16x16 extension icon
│   ├── icon48.png         # 48x48 extension icon
│   └── icon128.png        # 128x128 extension icon
└── README.md              # This file
```

## Technical Details

### Technologies Used
- **HTML5** - Semantic markup for the popup interface
- **CSS3** - Modern styling with gradients, animations, and responsive design
- **JavaScript (ES6+)** - Extension logic and Chrome APIs integration
- **Chrome Extension APIs**:
  - `chrome.storage.local` - Data persistence
  - `chrome.alarms` - Scheduled reminders
  - `chrome.notifications` - System notifications
  - `chrome.runtime` - Message passing between components

### Browser Support
- Chrome 88+ (Manifest V3 support required)
- Chromium-based browsers (Edge, Brave, Opera)

### Permissions
- `storage` - Save user preferences and hydration data
- `alarms` - Schedule reminder notifications
- `notifications` - Display hydration reminders

## Development

### Local Development
1. Clone the repository
2. Make your changes to the source files
3. Load the extension in Chrome developer mode
4. Test your changes and reload the extension as needed

### Key Components

**Popup Interface (`popup.js`)**
- Handles user interactions
- Updates UI based on current state
- Communicates with background script

**Background Service Worker (`background.js`)**
- Manages alarms and notifications
- Handles data persistence
- Processes daily resets

**Storage System**
- All data stored locally using Chrome's storage API
- Automatic daily reset at midnight
- Streak calculation and maintenance

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Privacy

This extension:
- ✅ Stores all data locally on your device
- ✅ Does not collect or transmit personal information
- ✅ Does not require internet connection to function
- ✅ Does not track user behavior

## License

MIT License - feel free to use and modify as needed.

## Support

If you encounter any issues or have suggestions:
1. Check the browser console for error messages
2. Try disabling and re-enabling the extension
3. Reload the extension in developer mode
4. File an issue on the project repository

---

**Stay hydrated! 💧** 