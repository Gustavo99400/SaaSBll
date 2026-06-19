const admin = require('firebase-admin');
const serviceAccount = require('./src/firebase/firebase-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

async function run() {
  const email = 'nuevaempresa10@gmail.com';
  console.log(`Setting password for ${email}...`);
  
  const user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, {
    password: 'Password123!',
  });
  
  await auth.setCustomUserClaims(user.uid, {
    role: 'EMPRESA',
    tenantId: 'zgZEFQicsUoysmmi0zqH',
    requiresPasswordChange: false,
  });
  
  console.log('Password and claims updated successfully.');
}

run().catch(console.error);
