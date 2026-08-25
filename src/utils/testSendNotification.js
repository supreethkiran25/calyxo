import { exec } from 'child_process';
import { triggerOSNotification, sendTestNotification } from '../services/notificationService.js';

console.log('🚀 Triggering Calyxo Test Notification...');

const sampleNotification = {
  title: 'Calyxo Quad Rings Synced 🔥',
  body: 'Steps: 7,420 / 10,000 | Calories: 1,450 kcal | Hydration: 2,000ml active on Home Screen!',
  url: '/user/dashboard'
};

console.log('📦 Notification Payload:');
console.log(JSON.stringify(sampleNotification, null, 2));

try {
  await sendTestNotification(sampleNotification);
  console.log('✅ PASS: sendTestNotification executed successfully with all platform bridges wired.');

  // If running on macOS Node CLI, trigger native macOS system notification banner!
  if (process.platform === 'darwin') {
    const escapedTitle = sampleNotification.title.replace(/"/g, '\\"');
    const escapedBody = sampleNotification.body.replace(/"/g, '\\"');
    const script = `osascript -e 'display notification "${escapedBody}" with title "${escapedTitle}" sound name "default"'`;
    
    exec(script, (error) => {
      if (error) {
        console.warn('⚠️ Could not display macOS desktop alert banner:', error.message);
      } else {
        console.log('🔔 macOS Desktop Notification Banner triggered on your Mac!');
      }
    });
  }
} catch (err) {
  console.error('❌ Notification trigger error:', err);
}
