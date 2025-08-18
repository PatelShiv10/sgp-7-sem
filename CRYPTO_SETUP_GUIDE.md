# 🔐 Crypto Setup Guide - Fix Encryption/Decryption Issues

## 🚨 Current Issue
You're experiencing encryption/decryption failures because:
1. Existing messages in the database don't have ephemeral public keys
2. Crypto keys may not be properly initialized
3. Legacy messages cannot be decrypted with the new system

## 🔧 Step-by-Step Fix

### Step 1: Run Database Migration
First, migrate existing messages to handle legacy data:

```bash
cd backend
npm run migrate-messages
```

This will mark existing messages as legacy and prevent decryption errors.

### Step 2: Initialize Crypto Keys
In the chat interface, use the new debugging buttons:

1. **Click "Show Key Info"** - Check current crypto key status
2. **Click "Initialize Keys"** - Generate new crypto keys if missing
3. **Click "Validate Keys"** - Verify keys are working correctly
4. **Click "Debug Crypto"** - Test the encryption/decryption system

### Step 3: Test the System
1. Send a new test message
2. Check if it decrypts properly
3. Verify no more "Decryption Failed" errors

## 🛠️ Debugging Tools Available

### Frontend Debug Buttons:
- **Debug Crypto**: Tests encryption/decryption functionality
- **Initialize Keys**: Creates new crypto keys
- **Regenerate Keys**: Removes old keys and creates new ones
- **Validate Keys**: Checks if keys are working properly
- **Show Key Info**: Displays current key status

### Console Logging:
- Detailed logs for encryption/decryption attempts
- Key status information
- Error details for troubleshooting

## 🔍 Troubleshooting

### If you see "Legacy Message" errors:
- These are old messages that can't be decrypted
- New messages will work fine
- This is expected behavior after migration

### If crypto keys are missing:
1. Click "Initialize Keys" button
2. Refresh the page
3. Try sending a new message

### If validation fails:
1. Click "Regenerate Keys" button
2. Refresh the page
3. Test with "Debug Crypto" button

## 📋 Environment Configuration

The system now includes proper crypto configuration. No additional .env files are needed as the crypto system is self-contained.

## ✅ Success Indicators

You'll know the fix is working when:
- ✅ No more "require is not defined" errors
- ✅ New messages encrypt/decrypt properly
- ✅ Debug Crypto test passes
- ✅ Key validation shows "valid and working correctly"
- ✅ Legacy messages show clear "Legacy Message" indicator instead of errors

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check Console Logs**: Look for detailed error messages
2. **Use Debug Buttons**: Try all the debugging tools
3. **Clear Browser Data**: Clear localStorage and refresh
4. **Regenerate Keys**: Use the regenerate function to start fresh

## 📞 Support

The new debugging tools will help identify any remaining issues. Check the browser console for detailed logs and use the debug buttons to test each component of the crypto system.
