// DOM elements
const todayCountEl = document.getElementById('todayCount');
const streakCountEl = document.getElementById('streakCount');
const waterLevelEl = document.getElementById('waterLevel');
const hydrateBtnEl = document.getElementById('hydrateBtn');
const resetBtnEl = document.getElementById('resetBtn');
const reminderIntervalEl = document.getElementById('reminderInterval');
const dailyGoalEl = document.getElementById('dailyGoal');
const notificationsEnabledEl = document.getElementById('notificationsEnabled');

// Storage keys
const STORAGE_KEYS = {
    TODAY_COUNT: 'hydra_today_count',
    STREAK_COUNT: 'hydra_streak_count',
    LAST_DATE: 'hydra_last_date',
    REMINDER_INTERVAL: 'hydra_reminder_interval',
    DAILY_GOAL: 'hydra_daily_goal',
    NOTIFICATIONS_ENABLED: 'hydra_notifications_enabled'
};

// State
let currentData = {
    todayCount: 0,
    streakCount: 0,
    lastDate: null,
    reminderInterval: 60,
    dailyGoal: 8,
    notificationsEnabled: true
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    updateUI();
    checkDateReset();
});

// Load data from storage
async function loadData() {
    try {
        const result = await chrome.storage.local.get(Object.values(STORAGE_KEYS));
        
        currentData.todayCount = result[STORAGE_KEYS.TODAY_COUNT] || 0;
        currentData.streakCount = result[STORAGE_KEYS.STREAK_COUNT] || 0;
        currentData.lastDate = result[STORAGE_KEYS.LAST_DATE] || null;
        currentData.reminderInterval = result[STORAGE_KEYS.REMINDER_INTERVAL] || 60;
        currentData.dailyGoal = result[STORAGE_KEYS.DAILY_GOAL] || 8;
        currentData.notificationsEnabled = result[STORAGE_KEYS.NOTIFICATIONS_ENABLED] !== false;
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save data to storage
async function saveData() {
    try {
        const dataToSave = {
            [STORAGE_KEYS.TODAY_COUNT]: currentData.todayCount,
            [STORAGE_KEYS.STREAK_COUNT]: currentData.streakCount,
            [STORAGE_KEYS.LAST_DATE]: currentData.lastDate,
            [STORAGE_KEYS.REMINDER_INTERVAL]: currentData.reminderInterval,
            [STORAGE_KEYS.DAILY_GOAL]: currentData.dailyGoal,
            [STORAGE_KEYS.NOTIFICATIONS_ENABLED]: currentData.notificationsEnabled
        };
        
        await chrome.storage.local.set(dataToSave);
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    hydrateBtnEl.addEventListener('click', handleHydrate);
    resetBtnEl.addEventListener('click', handleReset);
    reminderIntervalEl.addEventListener('change', handleSettingsChange);
    dailyGoalEl.addEventListener('change', handleSettingsChange);
    notificationsEnabledEl.addEventListener('change', handleSettingsChange);
}

// Handle hydrate button click
async function handleHydrate(event) {
    // Add ripple effect
    createRipple(event);
    
    // Increment water count
    currentData.todayCount++;
    currentData.lastDate = new Date().toDateString();
    
    // Update streak if goal reached
    if (currentData.todayCount >= currentData.dailyGoal) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (currentData.lastDate === yesterday.toDateString()) {
            currentData.streakCount++;
        } else if (currentData.todayCount === currentData.dailyGoal) {
            currentData.streakCount = 1;
        }
    }
    
    await saveData();
    updateUI();
    
    // Send message to background script for notifications
    try {
        await chrome.runtime.sendMessage({
            action: 'hydrationUpdate',
            count: currentData.todayCount,
            goal: currentData.dailyGoal
        });
    } catch (error) {
        console.error('Error sending message to background:', error);
    }
}

// Handle reset button click
async function handleReset() {
    if (confirm('Are you sure you want to reset today\'s count?')) {
        currentData.todayCount = 0;
        await saveData();
        updateUI();
        
        try {
            await chrome.runtime.sendMessage({
                action: 'resetDay'
            });
        } catch (error) {
            console.error('Error sending reset message:', error);
        }
    }
}

// Handle settings changes
async function handleSettingsChange(event) {
    const { id, value, checked, type } = event.target;
    
    switch (id) {
        case 'reminderInterval':
            currentData.reminderInterval = parseInt(value);
            break;
        case 'dailyGoal':
            currentData.dailyGoal = parseInt(value);
            break;
        case 'notificationsEnabled':
            currentData.notificationsEnabled = checked;
            break;
    }
    
    await saveData();
    
    // Send settings update to background script
    try {
        await chrome.runtime.sendMessage({
            action: 'updateSettings',
            settings: {
                reminderInterval: currentData.reminderInterval,
                dailyGoal: currentData.dailyGoal,
                notificationsEnabled: currentData.notificationsEnabled
            }
        });
    } catch (error) {
        console.error('Error sending settings update:', error);
    }
}

// Update UI elements
function updateUI() {
    // Update counters
    todayCountEl.textContent = currentData.todayCount;
    streakCountEl.textContent = currentData.streakCount;
    
    // Update water level
    const percentage = Math.min((currentData.todayCount / currentData.dailyGoal) * 100, 100);
    waterLevelEl.style.height = `${percentage}%`;
    
    // Update settings
    reminderIntervalEl.value = currentData.reminderInterval;
    dailyGoalEl.value = currentData.dailyGoal;
    notificationsEnabledEl.checked = currentData.notificationsEnabled;
    
    // Update button text based on progress
    const remaining = Math.max(0, currentData.dailyGoal - currentData.todayCount);
    if (remaining === 0) {
        hydrateBtnEl.querySelector('.btn-text').textContent = '🎉 Goal Reached!';
    } else if (remaining === 1) {
        hydrateBtnEl.querySelector('.btn-text').textContent = '💧 One More Glass!';
    } else {
        hydrateBtnEl.querySelector('.btn-text').textContent = '💧 Drink Water';
    }
}

// Check if date has changed and reset if needed
function checkDateReset() {
    const today = new Date().toDateString();
    
    if (currentData.lastDate && currentData.lastDate !== today) {
        // New day - check if streak should continue
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (currentData.lastDate !== yesterday.toDateString() || currentData.todayCount < currentData.dailyGoal) {
            // Streak broken
            currentData.streakCount = 0;
        }
        
        // Reset daily count
        currentData.todayCount = 0;
        currentData.lastDate = today;
        
        saveData();
        updateUI();
    }
}

// Create ripple effect
function createRipple(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Utility function to format time
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'dataUpdated':
            loadData().then(() => {
                updateUI();
                sendResponse({ success: true });
            });
            break;
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
    
    return true; // Keep message channel open for async response
}); 