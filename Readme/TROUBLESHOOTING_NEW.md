# Troubleshooting Guide

## Common Issues and Solutions

### 🔔 Notifications

#### Issue: Notification Center not showing
**Symptoms:**
- Bell icon not visible in header
- No notification panel when clicked

**Solutions:**
1. Check if `NotificationCenter` is imported in `MainLayout.tsx`
2. Verify user is authenticated (`currentUser` exists)
3. Check browser console for import errors
4. Ensure `motion` package is installed

**Test:**
```javascript
// In browser console
console.log('User:', window.location.pathname);
testNotifications.testBasicNotification();
```

#### Issue: Notifications not appearing after sending
**Symptoms:**
- Send notification but it doesn't show up
- Badge count doesn't update

**Solutions:**
1. Check if user ID is correct
2. Verify database connection
3. Check browser console for errors
4. Test with console command

**Test:**
```javascript
// In browser console
testNotifications.testBasicNotification();
// Should see notification appear within 1-2 seconds
```

#### Issue: Browser notifications not working
**Symptoms:**
- No desktop notification popup
- Only in-app notifications show

**Solutions:**
1. Check browser notification permission
2. Grant permission when prompted
3. Check browser settings

**Fix:**
```javascript
// Request permission manually
Notification.requestPermission().then(permission => {
  console.log('Permission:', permission);
});

// Should be 'granted' for notifications to work
```

#### Issue: Unread count not updating
**Symptoms:**
- Badge shows wrong number
- Count doesn't decrease after reading

**Solutions:**
1. Click notification to mark as read
2. Wait 1-2 seconds for update
3. Refresh page if stuck
4. Check console for errors

**Debug:**
```javascript
// Check notification service
import { notificationService } from './services/notification';

const count = await notificationService.getUnreadCount(user.id);
console.log('Unread count:', count);
```

---

### 📱 SMS

#### Issue: SMS not sending
**Symptoms:**
- SMS function called but no message received
- No error in console

**Solutions:**
1. **This is normal!** SMS runs in mock mode by default
2. Check server logs for confirmation
3. For production, configure Twilio credentials

**Verification:**
```typescript
// Check SMS was logged
const result = await smsService.sendSMS('+233244123456', 'Test');
console.log('SMS Result:', result);

// Should see:
// { success: true, provider: 'mock', status: 'sent', ... }
```

**To Enable Production SMS:**
1. Go to Supabase Dashboard
2. Settings > Edge Functions > Secrets
3. Add these secrets:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM_NUMBER`

#### Issue: Invalid phone number error
**Symptoms:**
- SMS fails with "invalid phone number"

**Solutions:**
1. Use E.164 format: `+233244123456`
2. Use formatPhoneNumber helper

**Fix:**
```typescript
import { smsService } from './services/sms';

// Format phone number
const formatted = smsService.formatPhoneNumber('0244123456');
console.log('Formatted:', formatted); // +233244123456

// Validate before sending
const isValid = smsService.isValidPhoneNumber(formatted);
console.log('Is valid:', isValid); // true
```

#### Issue: Twilio error even with credentials
**Symptoms:**
- Twilio configured but getting errors
- "Authentication failed" message

**Solutions:**
1. Verify credentials are correct
2. Check Twilio account is active
3. Verify phone number has SMS capability
4. Check Twilio dashboard for errors

**Debug:**
```
Server Logs should show:
- "SMS to +233244123456: Your message"
- If error: "Twilio SMS error: [error message]"
- Falls back to mock mode on error
```

---

### 🎨 Glassmorphism

#### Issue: Glass effect not visible
**Symptoms:**
- Elements look solid, no blur
- Same as regular elements

**Solutions:**
1. Ensure there's content/color behind element
2. Check browser supports `backdrop-filter`
3. Verify classes are applied
4. Test in dark mode

**Test:**
```tsx
// Add test background
<div style={{ 
  background: 'linear-gradient(45deg, #9333EA, #EC4899)',
  padding: '2rem'
}}>
  <div className="glass-card rounded-xl p-6">
    <h3 className="glass-text">Should see blurred gradient</h3>
  </div>
</div>
```

#### Issue: Text hard to read
**Symptoms:**
- Text blends with background
- Poor contrast

**Solutions:**
1. Add `glass-text` class to all text
2. Use stronger glass variant (`.glass-strong`)
3. Increase text color contrast
4. Add text shadow manually

**Fix:**
```tsx
// Bad
<div className="glass">
  <h3>Hard to read</h3>
</div>

// Good
<div className="glass">
  <h3 className="glass-text">Easy to read</h3>
</div>
```

#### Issue: Browser doesn't support backdrop-filter
**Symptoms:**
- Glass effect not showing in old browser
- Looks solid instead of transparent

**Solutions:**
1. Use fallback background
2. Check browser version
3. Update browser if possible

**Fallback:**
```css
/* Add to your CSS */
@supports not (backdrop-filter: blur(10px)) {
  .glass {
    background: rgba(0, 0, 0, 0.8) !important;
  }
}
```

**Browser Support:**
- ✅ Chrome/Edge 76+
- ✅ Firefox 103+
- ✅ Safari 15.4+
- ❌ IE (not supported)

---

### 🗄️ Database

#### Issue: 401 Unauthorized errors
**Symptoms:**
- API calls failing with 401
- "Invalid or expired token" error

**Solutions:**
1. Check if user is authenticated
2. Verify access token is valid
3. Re-login if token expired
4. Check Supabase credentials

**Debug:**
```typescript
// Check auth status
import { supabase } from './services/database';

const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Should have access_token if logged in
```

#### Issue: 403 Forbidden errors
**Symptoms:**
- API calls failing with 403
- "Insufficient permissions" error

**Solutions:**
1. Check user role (admin, manager, cashier)
2. Verify endpoint allows user's role
3. Check RLS policies in Supabase

**Check Role:**
```typescript
import { useAuth } from './contexts/AuthContext';

const { user } = useAuth();
console.log('User role:', user?.role);
```

#### Issue: Data not saving
**Symptoms:**
- Operations seem to work but data not persisting
- No error messages

**Solutions:**
1. Check network tab for actual API calls
2. Verify data reaches backend
3. Check Supabase database directly
4. Look for validation errors

**Debug:**
```typescript
// Check if data saved
import { db } from './services/database';

const testData = await db.get('test-key');
console.log('Test data:', testData);

// Save test data
await db.set('test-key', { test: 'value' });

// Retrieve again
const retrieved = await db.get('test-key');
console.log('Retrieved:', retrieved);
```

#### Issue: Realtime subscriptions not working
**Symptoms:**
- Notifications don't update automatically
- Have to refresh to see new data

**Solutions:**
1. Check WebSocket connection
2. Verify Supabase realtime is enabled
3. Check subscription is active
4. Look for connection errors in console

**Debug:**
```javascript
// Check realtime status
const channel = supabase.channel('test');
console.log('Channel state:', channel.state);

// Should be 'joined' if working
```

---

### 🔐 Authentication

#### Issue: Can't login
**Symptoms:**
- Login fails with error
- Stuck on login screen

**Solutions:**
1. Verify email and password are correct
2. Check if user account exists
3. Look for specific error message
4. Try signing up new account

**Debug:**
```typescript
// Check Supabase auth
const { error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
});

if (error) {
  console.error('Login error:', error.message);
}
```

#### Issue: Session expires immediately
**Symptoms:**
- Logged in but immediately logged out
- Have to re-login frequently

**Solutions:**
1. Check browser cookies are enabled
2. Verify localStorage is accessible
3. Check Supabase session timeout settings
4. Look for auth state change errors

**Debug:**
```javascript
// Monitor auth state
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('Session:', session);
});
```

---

### 💻 Development

#### Issue: Hot reload not working
**Symptoms:**
- Changes not reflecting in browser
- Have to manually refresh

**Solutions:**
1. Check Vite dev server is running
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
4. Restart dev server

#### Issue: Build errors
**Symptoms:**
- Build fails with errors
- Type errors during build

**Solutions:**
1. Check for TypeScript errors
2. Verify all imports are correct
3. Run `npm install` to ensure dependencies
4. Check for syntax errors

**Common Fixes:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear cache
rm -rf .vite

# Rebuild
npm run build
```

#### Issue: Console full of errors
**Symptoms:**
- Many errors in browser console
- App seems to work but errors present

**Solutions:**
1. Read error messages carefully
2. Fix one error at a time (start from top)
3. Check if errors are from dependencies
4. Ignore harmless warnings

**Filter Console:**
```
In Chrome DevTools:
1. Click filter icon
2. Select "Errors" only
3. Focus on your app's errors (not library errors)
```

---

### 📱 Mobile

#### Issue: Layout broken on mobile
**Symptoms:**
- Elements overlapping
- Text too small/large
- Buttons not accessible

**Solutions:**
1. Test with responsive design mode
2. Check Tailwind breakpoints
3. Verify mobile styles applied
4. Test on actual device

**Debug:**
```tsx
// Add mobile-specific styles
<div className="p-4 md:p-6 lg:p-8">
  {/* Padding increases with screen size */}
</div>
```

#### Issue: Glassmorphism slow on mobile
**Symptoms:**
- Laggy scrolling
- Slow animations
- High CPU usage

**Solutions:**
1. Reduce glass elements on mobile
2. Decrease blur amount
3. Disable on low-end devices
4. Use CSS containment

**Optimize:**
```tsx
// Conditional glass for mobile
const glassClass = isMobile ? '' : 'glass-card';

<div className={glassClass}>
  Content
</div>
```

---

### 🧪 Testing

#### Issue: Test functions not available
**Symptoms:**
- `testNotifications` undefined in console
- Can't run test commands

**Solutions:**
1. Verify `NotificationTestProvider` is in App
2. Wait for app to fully load
3. Check for JavaScript errors
4. Try refreshing page

**Verify:**
```javascript
// Check if test functions exist
console.log('Test functions:', typeof testNotifications);

// Should log: 'object'
```

#### Issue: Tests failing
**Symptoms:**
- Test functions throw errors
- Notifications don't appear during test

**Solutions:**
1. Ensure you're logged in
2. Check console for specific errors
3. Try one test at a time
4. Verify services are initialized

**Step-by-step Test:**
```javascript
// Test one by one
testNotifications.testBasicNotification();
// Wait 2 seconds
testNotifications.testTransactionNotification();
// Wait 2 seconds
// etc.
```

---

### 🔧 Configuration

#### Issue: Environment variables not working
**Symptoms:**
- Features not working in production
- "Not configured" errors

**Solutions:**
1. Check Supabase Dashboard > Edge Functions > Secrets
2. Verify variable names match code
3. Restart edge functions after adding secrets
4. Check for typos

**Required Secrets:**
```
✅ SUPABASE_URL
✅ SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ PAYSTACK_SECRET_KEY
✅ PAYSTACK_PUBLIC_KEY
⚠️ TWILIO_ACCOUNT_SID (optional)
⚠️ TWILIO_AUTH_TOKEN (optional)
⚠️ TWILIO_FROM_NUMBER (optional)
```

---

### 🆘 Emergency Fixes

#### Nuclear Option: Clear Everything
If nothing else works, try this:

```bash
# 1. Stop dev server
# 2. Clear everything
rm -rf node_modules
rm -rf .vite
rm package-lock.json

# 3. Reinstall
npm install

# 4. Clear browser data
# - Open DevTools
# - Application tab
# - Clear storage
# - Clear all site data

# 5. Hard refresh
# - Ctrl+Shift+R (Windows)
# - Cmd+Shift+R (Mac)

# 6. Restart dev server
npm run dev
```

#### Check System Status
```javascript
// Run in console to check everything
console.log('Auth:', !!window.localStorage.getItem('sb-...'));
console.log('User:', typeof useAuth);
console.log('Notifications:', typeof testNotifications);
console.log('Database:', typeof db);
console.log('SMS:', typeof smsService);
```

---

### 📞 Getting Help

If you're still stuck:

1. **Check Documentation:**
   - `/QUICK_START_NEW.md` - Quick guide
   - `/NOTIFICATIONS_SMS_GUIDE.md` - Notification details
   - `/GLASSMORPHISM_GUIDE.md` - Glass effects
   - `/SYSTEM_UPGRADE_LATEST.md` - Full changelog

2. **Check Logs:**
   - Browser console (F12)
   - Supabase Dashboard > Edge Functions > Logs
   - Network tab for API calls

3. **Minimal Reproduction:**
   - Isolate the issue
   - Test with minimal code
   - Note exact error messages

4. **System Info:**
   - Browser version
   - Operating system
   - Node version
   - Error stack trace

---

## Quick Reference

### Common Commands

```bash
# Dev server
npm run dev

# Build
npm run build

# Type check
npx tsc --noEmit

# Clear cache
rm -rf .vite
```

### Console Commands

```javascript
// Test notifications
testNotifications.testAllNotifications()

// Check auth
import { supabase } from './services/database';
supabase.auth.getSession()

// Test SMS
import { smsService } from './services/sms';
smsService.sendSMS('+233244123456', 'Test')

// Check database
import { db } from './services/database';
db.get('test-key')
```

### Keyboard Shortcuts

```
Ctrl+Shift+I / Cmd+Option+I - Open DevTools
Ctrl+Shift+R / Cmd+Shift+R - Hard refresh
F12 - Toggle DevTools
```

---

## Checklist

Use this to verify everything is working:

- [ ] Can login successfully
- [ ] See notification bell in header
- [ ] Can send test notification via console
- [ ] Notification appears in panel
- [ ] Badge count updates
- [ ] Can mark notification as read
- [ ] Glass effects visible on dashboard
- [ ] Text readable in glass elements
- [ ] SMS works in mock mode (check logs)
- [ ] Database operations work
- [ ] No errors in console
- [ ] App loads without issues

If all checkboxes are ticked, everything is working correctly!
