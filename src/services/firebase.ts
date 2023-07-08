import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

import 'firebase/auth'
import 'firebase/database'

const firebaseConfig = {
    apiKey: 'AIzaSyDzsMGAeTmoBU3Jaj6aFeXi-EcM3e8WeJc',
    authDomain: 'arraiapd.firebaseapp.com',
    databaseURL: "https://arraiapd-default-rtdb.firebaseio.com/",
    projectId: 'arraiapd',
    storageBucket: "arraiapd.appspot.com",
    messagingSenderId: "817800902725",
    appId: "1:817800902725:web:cf190bcfbf4f032e2a0b2c"
};

const app = initializeApp(firebaseConfig)

const database = getDatabase(app)
const storage = getStorage(app)

export { database, storage }