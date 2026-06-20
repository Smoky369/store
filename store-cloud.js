(function () {
  const config = window.storeFirebaseConfig || {};
  const hasFirebaseConfig = Boolean(config.apiKey && config.projectId && config.appId);

  if (!hasFirebaseConfig || !window.firebase) {
    window.storeCloud = {
      enabled: false,
      load: async () => null,
      save: async () => false,
      subscribe: () => () => {}
    };
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

    const db = firebase.firestore();
    const storeDoc = db.collection('storeSettings').doc('main');

    window.storeCloud = {
      enabled: true,
      load: async () => {
        const snapshot = await storeDoc.get();
        return snapshot.exists ? snapshot.data() : null;
      },
      save: async (data) => {
        await storeDoc.set({
          ...data,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return true;
      },
      subscribe: (callback) => storeDoc.onSnapshot((snapshot) => {
        if (snapshot.exists) callback(snapshot.data());
      })
    };
  } catch (error) {
    console.warn('Cloud sync is disabled:', error);
    window.storeCloud = {
      enabled: false,
      load: async () => null,
      save: async () => false,
      subscribe: () => () => {}
    };
  }
}());
