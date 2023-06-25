// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getStorage, ref, uploadBytes } from "firebase/storage";
// import firebaseConfig from "../congig/firebase_storage.json";
const { initializeApp } = require("firebase/app");
const firebaseConfig = require("../congig/firebase_storage.json");
const {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} = require("firebase/storage");
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadFile(name, file, contentType = "image/jpeg") {
  try {
    const storageRef = ref(storage, name);
    const metadata = {
      contentType: contentType,
    };
    const res = await uploadBytes(storageRef, file, metadata);
  } catch (err) {
    throw err;
  }
}

async function getUrl(name) {
  try {
    const url = await getDownloadURL(ref(storage, name));
    return url;
  } catch (err) {
    throw err;
  }
}

module.exports = { uploadFile, getUrl };
