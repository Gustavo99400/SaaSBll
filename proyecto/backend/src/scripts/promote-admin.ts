import * as admin from 'firebase-admin';
import * as serviceAccount from '../firebase/firebase-config.json';

const serviceAccountClone = JSON.parse(JSON.stringify(serviceAccount));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountClone),
});

const email = process.argv[2];

if (!email) {
  console.error('Por favor, proporciona un correo electrónico. Uso: npx ts-node src/scripts/promote-admin.ts correo@ejemplo.com');
  process.exit(1);
}

async function promote() {
  try {
    const user = await admin.auth().getUserByEmail(email);
    const password = process.argv[3] || 'Glamy123!';
    
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'SUPER_ADMIN',
    });
    
    await admin.auth().updateUser(user.uid, {
      password: password,
    });
    
    console.log(`¡Éxito! El usuario ${email} ahora tiene el rol de SUPER_ADMIN.`);
    console.log(`La clave de acceso se ha actualizado a: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error al promover usuario:', error);
    process.exit(1);
  }
}

promote();
