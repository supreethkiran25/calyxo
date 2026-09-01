# CALYXO — PHASE 12: SUBSCRIPTION TIMELINE & STATE UI SPECIFICATION

---

## 1. Executive Summary

Phase 12 enforces single-source-of-truth subscription timeline rendering across Web and Native platforms. The UI eliminates ambiguous subscription states, providing explicit display of billing dates, expiry boundaries, cancellation statuses, and zero date fabrication.

---

## 2. Canonical Subscription Timeline Rules

```javascript
// SubscriptionManager.getSubscriptionTimeline(userProfile, user)
const status = this.getSubscriptionStatus(userProfile, user);
const isCancelled = Boolean(userProfile?.is_cancelled || userProfile?.isCancelled);
const expiresAt = userProfile?.subscriptionExpiresAt || userProfile?.subscription_expiry || status.expiresAt || null;
const nextBillingDate = userProfile?.next_billing_date || (isCancelled ? null : expiresAt);
```

### Presentation Matrix

| Subscription State | Cancellation Status | Timeline Label | Displayed Date | Primary Action Button |
| :--- | :--- | :--- | :--- | :--- |
| **Active (Auto-Renewing)** | False | `Next billing date` | `nextBillingDate` formatted | `Cancel Subscription` |
| **Cancelled (Grace Period)** | True | `Active until` | `expiresAt` formatted | `Restore Subscription` |
| **Fixed Pass (Non-Renewing)**| N/A | `Expires` | `expiresAt` formatted | `Renew Subscription` |
| **Free Tier / Missing Date** | N/A | `null` (No fake date) | `null` | `Subscribe via Razorpay` |

---

## 3. UI Implementation Details

In `SettingsDrawerPanel.jsx`:
- Connected to `SubscriptionManager.getSubscriptionTimeline()`.
- Renders:
  ```jsx
  {subTimeline.timelineLabel && subTimeline.timelineDate && (
    <p className="text-[10px] font-medium text-[var(--foreground)] mt-0.5">
      {subTimeline.timelineLabel}: <span className="font-bold text-[var(--color-acid-green)]">
        {new Date(subTimeline.timelineDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    </p>
  )}
  ```
- Gracefully handles cancelled subscriptions by displaying "Cancelled (Active)" badge instead of generic "Active".

---

## 4. Verification Evidence

- `src/utils/paymentProductionTestRunner.js`: 39 / 39 tests passed (100%).
- `src/utils/nativeResponsiveStateTestRunner.js`: 20 / 20 tests passed (100%).
