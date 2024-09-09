// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Make sure the user is authenticated and authorized
  if (!context.auth) {
    return { error: 'User must be authenticated' };
  }

  const uid = data.uid;

  try {
    await admin.auth().deleteUser(uid);
    return { message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: 'Failed to delete user: ' + error.message };
  }
});
