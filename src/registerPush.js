import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { ref, update, get } from "firebase/database";
import { db } from "./firebase";

export async function registerPush(uid) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const token = await getToken(messaging, {
      vapidKey: "BPXYps74g1j26mhp3V3pD3cGo_YlYGhe0tBdDcfDZ-K7hdYhaumCaRI1jX_4CcwahzVcm1tT10rg5SaqQP4e4qA"
    });

    if (!token) return;

    // 🔎 CHECK IF TOKEN ALREADY STORED
    const tokenRef = ref(db, `users/${uid}/fcmToken`);
    const snap = await get(tokenRef);

    if (snap.exists() && snap.val() === token) {
      return; // token unchanged → no update needed
    }

    // ✅ SAVE ONLY IF NEW / CHANGED
    await update(ref(db, `users/${uid}`), {
      fcmToken: token
    });

   // console.log("Push token saved");

  } catch (err) {
    console.error("Push registration failed:", err);
  }
}