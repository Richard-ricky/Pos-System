# Troubleshooting Guide

## Authentication Issues

### ❌ "Invalid login credentials" Error

**Cause**: User account doesn't exist in Supabase

**Solutions**:

1. **Create a new account**:
   - Click "Create New Account" button on login screen
   - Enter your full name, email, and password (min 6 characters)
   - Click "Create Account"
   - After successful creation, sign in with your credentials

2. **Check if account exists**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard/project/mzvnlzsbmkqwnvlziucd)
   - Navigate to **Authentication** → **Users**
   - Look for your email address
   - If not found, create account using method 1

3. **Verify credentials**:
   - Double-check email spelling
   - Ensure password is correct (case-sensitive)
   - Password must be at least 6 characters

### ❌ "Unauthorized" or "Invalid Token" Error

**Cause**: Session expired or invalid

**Solution**:
- Sign out and sign in again
- Clear browser cache and localStorage
- Try in incognito/private browsing mode

### ❌ Can't Create Account

**Cause**: Email already exists or network issue

**Solutions**:
1. Try a different email address
2. Check your internet connection
3. Check browser console for specific error (F12 → Console)
4. Try again in a few minutes

## Role & Permissions Issues

### ❌ Can't See Analytics Dashboard

**Symptoms**: Analytics tab is missing from navigation

**Cause**: You have "cashier" role

**Solution**:
Upgrade your role to "admin" or "manager":

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/mzvnlzsbmkqwnvlziucd/database/tables)
2. Open **Table Editor** → `kv_store_45351b4f`
3. Find your user record (key starts with `user:`)
4. Click to edit
5. Change `"role": "cashier"` to `"role": "admin"`
6. Save
7. Sign out and sign in again

### ❌ Can't Delete Products

**Symptoms**: Delete button missing or error when deleting

**Cause**: You need admin role

**Solution**:
- Only **admin** role can delete products
- **Manager** can create/update but not delete
- Upgrade to admin role (see above)

### ❌ "Insufficient Permissions" Error

**Cause**: Your role doesn't have access to this feature

**Solution**:
- Check your current role (click user icon in top right)
- Request admin to upgrade your role
- Or create a new admin account and use that

## Display & UI Issues

### ❌ Page is Not Black Theme

**Cause**: Dark mode not applied

**Solution**:
1. Refresh the page (F5 or Ctrl+R)
2. Clear browser cache
3. Check if `dark` class is on `<html>` element (F12 → inspect `<html>`)
4. The app automatically adds dark class on load

### ❌ Components Look Broken or Missing Styles

**Cause**: CSS not loaded properly

**Solutions**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check browser console for CSS errors
4. Restart dev server: `npm run dev`

### ❌ Icons Not Showing

**Cause**: lucide-react not loaded

**Solution**:
```bash
npm install lucide-react
```

## Data Issues

### ❌ No Products in POS

**Cause**: Products not loaded from localStorage

**Solutions**:
1. Refresh the page
2. Check browser console for errors (F12)
3. Clear localStorage and reload:
   ```javascript
   localStorage.clear()
   location.reload()
   ```
4. Products will be recreated automatically

### ❌ Wallet Balance Not Updating

**Cause**: LocalStorage sync issue

**Solutions**:
1. Refresh the page
2. Check that transactions are being created
3. Clear localStorage:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

### ❌ Transactions Not Showing

**Cause**: Not synced with backend or localStorage issue

**Solutions**:
1. Check if you're logged in
2. Verify internet connection
3. Check browser console for API errors
4. Try creating a new transaction
5. Sign out and sign in again

## API & Backend Issues

### ❌ "Failed to fetch" or Network Errors

**Cause**: Can't reach Supabase backend

**Solutions**:
1. Check internet connection
2. Verify Supabase is not down: https://status.supabase.com
3. Check browser console for specific error
4. Try again in a few minutes
5. Check if firewall/antivirus is blocking requests

### ❌ "CORS Error"

**Cause**: Cross-origin request blocked

**Solution**:
- This shouldn't happen with the current setup
- If it does, check that you're using the correct API URL
- Backend already has CORS enabled for all origins

### ❌ Analytics/ML Features Not Working

**Cause**: Not enough data or Python ML service not running

**Solutions**:
1. **For basic ML** (TypeScript engine):
   - Works automatically
   - Create some test transactions first
   - Refresh analytics page

2. **For advanced ML** (Python service):
   - Python ML API is optional
   - TypeScript ML engine handles most features
   - To use Python service:
     ```bash
     cd ml_models
     pip install -r requirements.txt
     python ml_api_service.py
     ```

### ❌ Fraud Detection Always Flagging

**Cause**: You're making unusual transactions

**This is normal!** Fraud detection flags:
- Very large amounts (>GHS 1000)
- Rapid successive transactions
- Unusual patterns for your account
- First-time large transactions

**Solutions**:
- This is a security feature, not a bug
- Continue using normally, system will learn
- Check risk score in transaction details
- Admin can review flagged transactions

## Performance Issues

### ❌ App is Slow

**Solutions**:
1. **Clear browser cache**
2. **Close unnecessary tabs**
3. **Check browser console** for errors (F12)
4. **Disable browser extensions**
5. **Use latest Chrome/Firefox/Safari**

### ❌ Charts Not Loading

**Cause**: recharts not installed or data issue

**Solutions**:
```bash
npm install recharts
```
Then refresh the page

## Development Issues

### ❌ `npm run dev` Fails

**Cause**: Dependencies not installed or port conflict

**Solutions**:
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Port already in use**:
   ```bash
   # Kill process on port 5173
   # Linux/Mac:
   lsof -ti:5173 | xargs kill
   
   # Windows:
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F
   ```

3. **Clear node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### ❌ TypeScript Errors

**Cause**: Type mismatch or missing types

**Solutions**:
1. Check error message carefully
2. Install missing type definitions
3. Restart TypeScript server in VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"

### ❌ Import Errors

**Cause**: Module not found

**Solutions**:
1. Check import path is correct
2. Install missing package:
   ```bash
   npm install <package-name>
   ```
3. Check package.json has the dependency

## Browser-Specific Issues

### Chrome/Edge
- Clear site data: F12 → Application → Clear site data
- Disable cache: F12 → Network tab → "Disable cache"

### Firefox
- Clear site data: F12 → Storage → Clear all
- Disable cache: F12 → Network tab → Settings → "Disable HTTP cache"

### Safari
- Clear cache: Develop → Empty Caches
- Enable developer tools: Preferences → Advanced → Show Develop menu

## Common Error Messages & Fixes

### "Cannot read properties of undefined"
- Check that data is loaded before accessing it
- Add null/undefined checks
- Refresh the page

### "NetworkError when attempting to fetch resource"
- Check internet connection
- Verify Supabase URL is correct
- Check browser console for specific URL

### "Unexpected token" or JSON parse error
- Backend returned invalid JSON
- Check API response in Network tab (F12)
- Report specific error with request URL

### "Maximum update depth exceeded"
- Infinite loop in useEffect
- Check useEffect dependencies
- This is a development error, check console

## Still Having Issues?

1. **Check browser console** (F12 → Console) for specific errors
2. **Check Network tab** (F12 → Network) for failed requests
3. **Clear everything and start fresh**:
   ```javascript
   // In browser console (F12)
   localStorage.clear()
   sessionStorage.clear()
   location.reload()
   ```
4. **Try incognito/private mode** to rule out extensions/cache
5. **Check Supabase status**: https://status.supabase.com

## Debug Mode

To enable verbose logging:

```javascript
// In browser console
localStorage.setItem('debug', 'true')
location.reload()
```

This will show more detailed logs in the console.

## Getting Help

When reporting issues, include:
- Error message (exact text)
- Browser and version
- Steps to reproduce
- Screenshot of error (if applicable)
- Browser console logs (F12 → Console)
- Network errors (F12 → Network → failed requests)

---

**Most issues are solved by**:
1. ✅ Creating an account (not using demo credentials)
2. ✅ Refreshing the page
3. ✅ Clearing cache/localStorage
4. ✅ Checking browser console for errors
