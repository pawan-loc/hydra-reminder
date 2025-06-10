// Storage keys (same as popup.js)
const STORAGE_KEYS = {
    TODAY_COUNT: 'hydra_today_count',
    STREAK_COUNT: 'hydra_streak_count',
    LAST_DATE: 'hydra_last_date',
    REMINDER_INTERVAL: 'hydra_reminder_interval',
    DAILY_GOAL: 'hydra_daily_goal',
    NOTIFICATIONS_ENABLED: 'hydra_notifications_enabled'
};

// Default settings
const DEFAULT_SETTINGS = {
    reminderInterval: 60,
    dailyGoal: 8,
    notificationsEnabled: true
};

// Install event - setup initial alarms
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Hydra Reminder extension installed');
    
    // Initialize default settings
    await setupDefaultSettings();
    
    // Setup reminder alarm
    await setupReminderAlarm();
    
    // Setup daily reset alarm
    await setupDailyResetAlarm();
});

// Startup event - restore alarms
chrome.runtime.onStartup.addListener(async () => {
    console.log('Hydra Reminder extension started');
    await setupReminderAlarm();
    await setupDailyResetAlarm();
});

// Handle messages from popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    try {
        switch (message.action) {
            case 'hydrationUpdate':
                await handleHydrationUpdate(message.count, message.goal);
                sendResponse({ success: true });
                break;
                
            case 'updateSettings':
                await handleSettingsUpdate(message.settings);
                sendResponse({ success: true });
                break;
                
            case 'resetDay':
                await handleDayReset();
                sendResponse({ success: true });
                break;
                
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    } catch (error) {
        console.error('Error handling message:', error);
        sendResponse({ success: false, error: error.message });
    }
    
    return true; // Keep message channel open for async response
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log('Alarm triggered:', alarm.name);
    
    switch (alarm.name) {
        case 'hydra-reminder':
            await handleReminderAlarm();
            break;
            
        case 'daily-reset':
            await handleDailyReset();
            break;
    }
});

// Setup default settings on install
async function setupDefaultSettings() {
    try {
        const result = await chrome.storage.local.get(Object.values(STORAGE_KEYS));
        
        // Only set defaults if values don't exist
        const updates = {};
        
        if (result[STORAGE_KEYS.REMINDER_INTERVAL] === undefined) {
            updates[STORAGE_KEYS.REMINDER_INTERVAL] = DEFAULT_SETTINGS.reminderInterval;
        }
        
        if (result[STORAGE_KEYS.DAILY_GOAL] === undefined) {
            updates[STORAGE_KEYS.DAILY_GOAL] = DEFAULT_SETTINGS.dailyGoal;
        }
        
        if (result[STORAGE_KEYS.NOTIFICATIONS_ENABLED] === undefined) {
            updates[STORAGE_KEYS.NOTIFICATIONS_ENABLED] = DEFAULT_SETTINGS.notificationsEnabled;
        }
        
        if (result[STORAGE_KEYS.TODAY_COUNT] === undefined) {
            updates[STORAGE_KEYS.TODAY_COUNT] = 0;
        }
        
        if (result[STORAGE_KEYS.STREAK_COUNT] === undefined) {
            updates[STORAGE_KEYS.STREAK_COUNT] = 0;
        }
        
        if (Object.keys(updates).length > 0) {
            await chrome.storage.local.set(updates);
        }
    } catch (error) {
        console.error('Error setting up default settings:', error);
    }
}

// Setup reminder alarm
async function setupReminderAlarm() {
    try {
        // Clear existing alarm
        await chrome.alarms.clear('hydra-reminder');
        
        // Get current settings
        const result = await chrome.storage.local.get([
            STORAGE_KEYS.REMINDER_INTERVAL,
            STORAGE_KEYS.NOTIFICATIONS_ENABLED
        ]);
        
        const interval = result[STORAGE_KEYS.REMINDER_INTERVAL] || DEFAULT_SETTINGS.reminderInterval;
        const enabled = result[STORAGE_KEYS.NOTIFICATIONS_ENABLED] !== false;
        
        if (enabled) {
            // Create new alarm
            await chrome.alarms.create('hydra-reminder', {
                delayInMinutes: interval,
                periodInMinutes: interval
            });
            
            console.log(`Reminder alarm set for every ${interval} minutes`);
        }
    } catch (error) {
        console.error('Error setting up reminder alarm:', error);
    }
}

// Setup daily reset alarm
async function setupDailyResetAlarm() {
    try {
        // Clear existing alarm
        await chrome.alarms.clear('daily-reset');
        
        // Set alarm for midnight
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0); // Next midnight
        
        const delayInMinutes = Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60));
        
        await chrome.alarms.create('daily-reset', {
            delayInMinutes: delayInMinutes,
            periodInMinutes: 24 * 60 // 24 hours
        });
        
        console.log(`Daily reset alarm set for ${delayInMinutes} minutes from now`);
    } catch (error) {
        console.error('Error setting up daily reset alarm:', error);
    }
}

// Handle hydration update
async function handleHydrationUpdate(count, goal) {
    try {
        // Check if goal is reached
        if (count >= goal) {
            await showNotification(
                'Hydra Reminder - Goal Achieved! 🎉',
                `Congratulations! You've reached your daily goal of ${goal} glasses of water!`,
                'goal-achieved'
            );
        } else if (count === Math.ceil(goal * 0.5)) {
            // Halfway point notification
            await showNotification(
                'Hydra Reminder - Halfway There! 💪',
                `Great job! You're halfway to your daily goal. ${goal - count} glasses to go!`,
                'halfway'
            );
        }
    } catch (error) {
        console.error('Error handling hydration update:', error);
    }
}

// Handle settings update
async function handleSettingsUpdate(settings) {
    try {
        // Update reminder alarm if interval changed
        if (settings.reminderInterval) {
            await setupReminderAlarm();
        }
        
        console.log('Settings updated:', settings);
    } catch (error) {
        console.error('Error handling settings update:', error);
    }
}

// Handle day reset
async function handleDayReset() {
    try {
        const result = await chrome.storage.local.get([
            STORAGE_KEYS.TODAY_COUNT,
            STORAGE_KEYS.STREAK_COUNT,
            STORAGE_KEYS.DAILY_GOAL,
            STORAGE_KEYS.LAST_DATE
        ]);
        
        const todayCount = result[STORAGE_KEYS.TODAY_COUNT] || 0;
        const streakCount = result[STORAGE_KEYS.STREAK_COUNT] || 0;
        const dailyGoal = result[STORAGE_KEYS.DAILY_GOAL] || 8;
        const lastDate = result[STORAGE_KEYS.LAST_DATE];
        
        // Reset daily count
        const updates = {
            [STORAGE_KEYS.TODAY_COUNT]: 0,
            [STORAGE_KEYS.LAST_DATE]: new Date().toDateString()
        };
        
        // Handle streak logic
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate !== yesterday.toDateString() || todayCount < dailyGoal) {
            // Streak broken or not maintained
            updates[STORAGE_KEYS.STREAK_COUNT] = 0;
        }
        
        await chrome.storage.local.set(updates);
        
        console.log('Daily reset completed');
    } catch (error) {
        console.error('Error handling day reset:', error);
    }
}

// Handle reminder alarm
async function handleReminderAlarm() {
    try {
        const result = await chrome.storage.local.get([
            STORAGE_KEYS.TODAY_COUNT,
            STORAGE_KEYS.DAILY_GOAL,
            STORAGE_KEYS.NOTIFICATIONS_ENABLED
        ]);
        
        const todayCount = result[STORAGE_KEYS.TODAY_COUNT] || 0;
        const dailyGoal = result[STORAGE_KEYS.DAILY_GOAL] || 8;
        const notificationsEnabled = result[STORAGE_KEYS.NOTIFICATIONS_ENABLED] !== false;
        
        if (!notificationsEnabled) {
            return;
        }
        
        const remaining = Math.max(0, dailyGoal - todayCount);
        
        let title, message;
        
        if (remaining === 0) {
            title = 'Hydra Reminder - Well Done! 🎉';
            message = 'You\'ve reached your daily goal! Keep up the great work!';
        } else if (remaining === 1) {
            title = 'Hydra Reminder - Almost There! 💧';
            message = 'Just one more glass to reach your daily goal!';
        } else {
            title = 'Hydra Reminder - Time to Hydrate! 💧';
            message = `Don't forget to drink water! You have ${remaining} glasses left today.`;
        }
        
        await showNotification(title, message, 'reminder');
    } catch (error) {
        console.error('Error handling reminder alarm:', error);
    }
}

// Handle daily reset alarm
async function handleDailyReset() {
    await handleDayReset();
    
    // Send message to popup if it's open
    try {
        await chrome.runtime.sendMessage({ action: 'dataUpdated' });
    } catch (error) {
        // Popup might not be open, ignore error
        console.log('Could not send message to popup (likely closed)');
    }
}

// Show notification
async function showNotification(title, message, id) {
    try {
        const result = await chrome.storage.local.get([STORAGE_KEYS.NOTIFICATIONS_ENABLED]);
        const notificationsEnabled = result[STORAGE_KEYS.NOTIFICATIONS_ENABLED] !== false;
        
        if (!notificationsEnabled) {
            return;
        }
        
        await chrome.notifications.create(`hydra-${id}-${Date.now()}`, {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: title,
            message: message,
            silent: false
        });
        
        console.log('Notification shown:', title);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// Handle notification clicks
chrome.notifications.onClicked.addListener(async (notificationId) => {
    try {
        // Clear the notification
        await chrome.notifications.clear(notificationId);
        
        // Open popup (if possible)
        // Note: In Manifest V3, we can't programmatically open the popup
        // But we can perform other actions here if needed
        
        console.log('Notification clicked:', notificationId);
    } catch (error) {
        console.error('Error handling notification click:', error);
    }
});

// Utility function to get time until next occurrence
function getTimeUntilNext(hour, minute = 0) {
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);
    
    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }
    
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60));
} 