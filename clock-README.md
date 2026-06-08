# 🌍 Digital Clock - Multiple Time Zones

A beautiful, responsive web application that displays the current time in different time zones around the world.

## ✨ Features

- 🕐 **Real-time digital clocks** - Updates every second
- 🌐 **23+ time zones** - Choose from major cities worldwide
- 📍 **Add/Remove timezones** - Easy to manage your timezone list
- 💾 **Persistent storage** - Your timezone selection is saved locally
- 📱 **Responsive design** - Works perfectly on desktop, tablet, and mobile
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations
- 📅 **Date display** - Shows full date and day of the week
- ⏱️ **UTC offset** - Displays timezone offset from UTC
- 🌈 **Smooth animations** - Delightful visual effects

## 🚀 Quick Start

1. **Open the application:**
   - Simply open `clock.html` in your web browser
   - Or navigate to the deployed version

2. **Add a timezone:**
   - Select a timezone from the dropdown menu
   - Click "+ Add Timezone" button
   - The clock will appear and update in real-time

3. **Remove a timezone:**
   - Click the "✕" button on any clock card
   - The timezone will be removed immediately

4. **Your selections are saved:**
   - All selected timezones are automatically saved to your browser
   - They will appear again when you reload the page

## 🌍 Available Time Zones

### North America
- 🗽 **New York** (EST)
- 🏙️ **Chicago** (CST)
- 🏔️ **Denver** (MST)
- 🌴 **Los Angeles** (PST)

### Europe
- 🇬🇧 **London** (GMT)
- 🇫🇷 **Paris** (CET)
- 🇩🇪 **Berlin** (CET)
- 🇷🇺 **Moscow** (MSK)

### Middle East & Africa
- 🇦🇪 **Dubai** (GST)
- 🇿🇦 **Johannesburg** (SAST)
- 🇪🇬 **Cairo** (EET)

### Asia
- 🇮🇳 **India** (IST)
- 🇹🇭 **Bangkok** (ICT)
- 🇭🇰 **Hong Kong** (HKT)
- 🇨🇳 **Shanghai** (CST)
- 🇯🇵 **Tokyo** (JST)
- 🇰🇷 **Seoul** (KST)
- 🇸🇬 **Singapore** (SGT)

### Pacific & Oceania
- 🦘 **Sydney** (AEDT)
- 🇦🇺 **Melbourne** (AEDT)
- 🇳🇿 **Auckland** (NZDT)

### South America
- 🇧🇷 **São Paulo** (BRT)

### UTC
- ⏰ **UTC** (Coordinated Universal Time)

## 📋 Display Information

Each clock card shows:
- **Timezone name** - IANA timezone identifier
- **City & emoji** - Visual location identifier
- **Digital time** - HH:MM:SS format
- **AM/PM indicator** - 12-hour format notation
- **Full date** - Day, month, and year
- **UTC offset** - Difference from UTC time

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (ES6+)** - Real-time updates and DOM manipulation
- **Intl API** - Timezone and date formatting
- **LocalStorage API** - Persistent user preferences

## 💡 How It Works

1. **Real-time updates** - Uses `setInterval()` to update every second
2. **Timezone calculation** - Uses JavaScript `Intl.DateTimeFormat` API
3. **UTC offset calculation** - Compares local time with UTC time
4. **Data persistence** - Saves selections in browser's LocalStorage
5. **Responsive grid** - CSS Grid auto-fills based on screen size

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🎯 Use Cases

- 📞 Schedule calls across time zones
- ⏰ Track team members in different locations
- 🌐 Plan international meetings
- 🎮 Coordinate gaming sessions worldwide
- 💼 Check business hours in different cities
- ✈️ Track flight times across zones

## 📝 Example Usage

```html
<!-- Simply open in browser -->
<open> clock.html
```

## 🔄 Adding More Time Zones

To add more timezones, edit the `TIMEZONES` object in `clock-script.js`:

```javascript
const TIMEZONES = {
    'Continent/City': { city: 'Display Name', emoji: '🌍' },
    // Add more...
};
```

## 🎨 Customization

### Change colors
Edit the gradient in `clock-styles.css`:
```css
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Change update frequency
Edit the interval in `clock-script.js`:
```javascript
setInterval(updateAllClocks, 1000); // in milliseconds
```

## 💾 Data Storage

Selected timezones are stored in browser's LocalStorage under the key:
```
worldclock_timezones
```

You can clear this data by:
```javascript
localStorage.removeItem('worldclock_timezones');
```

## 🐛 Troubleshooting

**Clocks not updating?**
- Refresh the page
- Check browser console for errors
- Ensure JavaScript is enabled

**Wrong time displayed?**
- Check your computer's system time and timezone
- Try a different timezone to verify
- Clear browser cache and reload

**Timezone not available?**
- Check IANA timezone database for correct name
- Add it to the `TIMEZONES` object in the code

## 📚 Resources

- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [UTC Offsets](https://en.wikipedia.org/wiki/List_of_UTC_time_offsets)

## 📄 License

MIT License - Feel free to use, modify, and distribute

---

**Made with ❤️ for time zone travelers around the world** 🌍⏰