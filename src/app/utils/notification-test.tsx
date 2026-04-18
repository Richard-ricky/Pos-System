import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  sendNotification, 
  sendTransactionNotification,
  sendWalletFundedNotification,
  sendPaymentSuccessNotification 
} from '../utils/notifications';

/**
 * Test utility to verify notification and SMS system
 * Use this in development to test the notification flow
 */
export function useNotificationTest() {
  const { currentUser } = useAuth();

  const testBasicNotification = async () => {
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    console.log('Testing basic notification...');
    await sendNotification({
      userId: currentUser.id,
      title: '🎉 Welcome!',
      message: 'Your notification system is working perfectly!',
      type: 'system',
    });
    console.log('✅ Basic notification sent');
  };

  const testTransactionNotification = async () => {
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    console.log('Testing transaction notification...');
    await sendTransactionNotification(
      currentUser.id,
      500.00,
      'credit',
      2500.00,
      'TXN_' + Date.now(),
      // Uncomment to test SMS
      // '+233244123456'
    );
    console.log('✅ Transaction notification sent');
  };

  const testWalletFundedNotification = async () => {
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    console.log('Testing wallet funded notification...');
    await sendWalletFundedNotification(
      currentUser.id,
      1000.00,
      'Paystack',
      5000.00,
      'PAY_' + Date.now(),
      // Uncomment to test SMS
      // '+233244123456'
    );
    console.log('✅ Wallet funded notification sent');
  };

  const testPaymentNotification = async () => {
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    console.log('Testing payment notification...');
    await sendPaymentSuccessNotification(
      currentUser.id,
      250.00,
      'John Doe',
      'PAY_' + Date.now(),
      // Uncomment to test SMS
      // '+233244123456'
    );
    console.log('✅ Payment notification sent');
  };

  const testAllNotifications = async () => {
    console.log('🧪 Running all notification tests...');
    await testBasicNotification();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testTransactionNotification();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testWalletFundedNotification();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testPaymentNotification();
    console.log('✅ All notification tests completed!');
  };

  return {
    testBasicNotification,
    testTransactionNotification,
    testWalletFundedNotification,
    testPaymentNotification,
    testAllNotifications,
  };
}

/**
 * Add this component to your app to enable testing via console
 * 
 * Usage:
 * 1. Add <NotificationTestProvider /> to your app
 * 2. Open browser console
 * 3. Run: window.testNotifications.testBasicNotification()
 * 4. Or run all tests: window.testNotifications.testAllNotifications()
 */
export function NotificationTestProvider() {
  const tests = useNotificationTest();

  useEffect(() => {
    // Expose test functions to window for easy console access
    (window as any).testNotifications = tests;
    console.log('🧪 Notification test functions loaded:');
    console.log('  - testNotifications.testBasicNotification()');
    console.log('  - testNotifications.testTransactionNotification()');
    console.log('  - testNotifications.testWalletFundedNotification()');
    console.log('  - testNotifications.testPaymentNotification()');
    console.log('  - testNotifications.testAllNotifications()');
  }, [tests]);

  return null;
}
