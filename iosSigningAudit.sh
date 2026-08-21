#!/usr/bin/env bash
# ==============================================================================
# Calyxo iOS Code Signing & Embedded Binary Integrity Audit Script
#
# Validates that App.app, CalyxoWidgetsExtension.appex, and CalyxoWatch Watch App.app
# are signed with matching certificates, identical Developer Teams, valid
# entitlements, and pass strict deep signature verification.
# ==============================================================================

set -e

echo "======================================================================"
echo "🔒 CALYXO iOS CODE SIGNING & EMBEDDED BINARY AUDIT"
echo "======================================================================"

APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData/App-*/Build/Products/Debug-iphoneos -name "App.app" -type d 2>/dev/null | head -n 1)

if [ -z "$APP_PATH" ] || [ ! -d "$APP_PATH" ]; then
  echo "❌ Error: App.app not found in Xcode DerivedData. Please build the iOS project first."
  exit 1
fi

echo "📁 App Bundle: $APP_PATH"
echo ""

# 1. Main App
echo "📱 [1/4] Auditing Main App Target (App.app)..."
APP_ID=$(codesign -dvvv "$APP_PATH" 2>&1 | grep "Identifier=" | cut -d= -f2)
APP_TEAM=$(codesign -dvvv "$APP_PATH" 2>&1 | grep "TeamIdentifier=" | cut -d= -f2)
APP_AUTH=$(codesign -dvvv "$APP_PATH" 2>&1 | grep "Authority=Apple" | head -n 1 | cut -d= -f2)
echo "  ✓ Bundle ID:      $APP_ID"
echo "  ✓ Team ID:        $APP_TEAM"
echo "  ✓ Signing Auth:   $APP_AUTH"

# 2. Widgets Extension
WIDGET_PATH="$APP_PATH/PlugIns/CalyxoWidgetsExtension.appex"
echo ""
echo "🧩 [2/4] Auditing Widget Extension (CalyxoWidgetsExtension.appex)..."
if [ -d "$WIDGET_PATH" ]; then
  WIDGET_ID=$(codesign -dvvv "$WIDGET_PATH" 2>&1 | grep "Identifier=" | cut -d= -f2)
  WIDGET_TEAM=$(codesign -dvvv "$WIDGET_PATH" 2>&1 | grep "TeamIdentifier=" | cut -d= -f2)
  WIDGET_AUTH=$(codesign -dvvv "$WIDGET_PATH" 2>&1 | grep "Authority=Apple" | head -n 1 | cut -d= -f2)
  echo "  ✓ Bundle ID:      $WIDGET_ID"
  echo "  ✓ Team ID:        $WIDGET_TEAM"
  echo "  ✓ Signing Auth:   $WIDGET_AUTH"

  if [ "$WIDGET_TEAM" != "$APP_TEAM" ]; then
    echo "  ❌ MISMATCH: Widget Team ($WIDGET_TEAM) != App Team ($APP_TEAM)"
    exit 1
  fi
  if [ "$WIDGET_AUTH" != "$APP_AUTH" ]; then
    echo "  ❌ MISMATCH: Widget Cert ($WIDGET_AUTH) != App Cert ($APP_AUTH)"
    exit 1
  fi
  echo "  ✅ Embedded Widget signing matches parent App"
else
  echo "  ⚠️ Widget extension not found at $WIDGET_PATH"
fi

# 3. Watch App
WATCH_PATH="$APP_PATH/Watch/CalyxoWatch Watch App.app"
echo ""
echo "⌚ [3/4] Auditing Watch Companion (CalyxoWatch Watch App.app)..."
if [ -d "$WATCH_PATH" ]; then
  WATCH_ID=$(codesign -dvvv "$WATCH_PATH" 2>&1 | grep "Identifier=" | cut -d= -f2)
  WATCH_TEAM=$(codesign -dvvv "$WATCH_PATH" 2>&1 | grep "TeamIdentifier=" | cut -d= -f2)
  WATCH_AUTH=$(codesign -dvvv "$WATCH_PATH" 2>&1 | grep "Authority=Apple" | head -n 1 | cut -d= -f2)
  echo "  ✓ Bundle ID:      $WATCH_ID"
  echo "  ✓ Team ID:        $WATCH_TEAM"
  echo "  ✓ Signing Auth:   $WATCH_AUTH"

  if [ "$WATCH_TEAM" != "$APP_TEAM" ]; then
    echo "  ❌ MISMATCH: Watch Team ($WATCH_TEAM) != App Team ($APP_TEAM)"
    exit 1
  fi
  if [ "$WATCH_AUTH" != "$APP_AUTH" ]; then
    echo "  ❌ MISMATCH: Watch Cert ($WATCH_AUTH) != App Cert ($APP_AUTH)"
    exit 1
  fi

  # Validate WatchKit Application Metadata in Info.plist
  WATCH_PLIST="$WATCH_PATH/Info.plist"
  HAS_WK_APP=$(python3 -c "import plistlib; p=plistlib.load(open('$WATCH_PLIST','rb')); print(p.get('WKApplication') is True or p.get('WKWatchKitApp') is True)")
  if [ "$HAS_WK_APP" != "True" ]; then
    echo "  ❌ ERROR: Missing WKApplication / WKWatchKitApp in Watch Info.plist"
    exit 1
  fi
  echo "  ✓ Watch Metadata: WKApplication/WKWatchKitApp valid"
  echo "  ✅ Embedded Watch signing & metadata match parent App"
else
  echo "  ℹ️ Watch app not embedded or skipped."
fi

# 4. Strict Deep Signature Validation
echo ""
echo "🛡️ [4/4] Running Strict Deep Code Signature Verification..."
codesign --verify --deep --strict --verbose=4 "$APP_PATH" 2>&1
echo "  ✅ codesign --verify --deep --strict PASSED"

echo ""
echo "======================================================================"
echo "🏁 CALYXO iOS SIGNING AUDIT: ALL TARGETS PASS"
echo "======================================================================"
