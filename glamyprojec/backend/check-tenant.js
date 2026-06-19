const admin = require('firebase-admin');
const serviceAccount = require('./src/firebase/firebase-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

async function run() {
  const tenantId = 'zgZEFQicsUoysmmi0zqH';
  console.log(`Searching for Tenant: ${tenantId}...`);
  
  const tenantDoc = await db.collection('tenants').doc(tenantId).get();
  if (!tenantDoc.exists) {
    console.log(`Tenant ${tenantId} not found in Firestore.`);
  } else {
    console.log('Tenant Firestore Data:', tenantDoc.data());
    const contactEmail = tenantDoc.data().contactEmail;
    console.log(`Contact Email: ${contactEmail}`);
    
    try {
      const userRecord = await auth.getUserByEmail(contactEmail);
      console.log('User Auth Record:', {
        uid: userRecord.uid,
        email: userRecord.email,
        customClaims: userRecord.customClaims,
        displayName: userRecord.displayName
      });
    } catch (e) {
      console.error('Error fetching user from Auth:', e.message);
    }
  }
}

run().catch(console.error);
