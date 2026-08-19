/**
 * Calyxo Universal Health Data Integration - Notification Manager
 * Quiet hours compliant notification triggers for step milestones and movement alerts
 */

export class HealthNotificationManager {
  /**
   * Check if current time falls within quiet hours (e.g., 10:00 PM - 7:00 AM)
   */
  static isQuietHours(startHour = 22, endHour = 7) {
    const currentHour = new Date().getHours();
    if (startHour > endHour) {
      return currentHour >= startHour || currentHour < endHour;
    }
    return currentHour >= startHour && currentHour < endHour;
  }

  /**
   * Dispatch smart health notification if permitted and outside quiet hours
   */
  static sendNotification(title, body, onNotifyCallback) {
    if (this.isQuietHours()) {
      console.log("Notification suppressed during quiet hours:", title);
      return;
    }

    if (onNotifyCallback) {
      onNotifyCallback(`${title}: ${body}`);
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
      } catch (e) {}
    }
  }

  /**
   * Evaluate metrics for milestone notifications
   */
  static evaluateStepMilestones(metrics = {}, goals = {}, onNotifyCallback) {
    const steps = metrics.steps || 0;
    const goal = goals.dailySteps || 10000;
    const diff = goal - steps;

    if (diff > 0 && diff <= 1000) {
      this.sendNotification(
        "Almost There! 🚶",
        `You are only ${diff.toLocaleString()} steps away from today's step goal. Excellent work!`,
        onNotifyCallback
      );
    } else if (steps >= goal) {
      this.sendNotification(
        "Goal Complete! 🎉",
        `Congratulations! You completed your daily goal of ${goal.toLocaleString()} steps.`,
        onNotifyCallback
      );
    }
  }
}
