import { ref, set } from "firebase/database";
import { auth, db } from "./firebase";

export default function JoinSplit({ splitId }) {
  const join = async () => {
    await set(ref(db, `splits/${splitId}/members/${auth.currentUser.uid}`), {
      name: auth.currentUser.displayName,
      email: auth.currentUser.email,
    });
  };

  return (
    <button className="btn btn-success w-100 mb-3" onClick={join}>
      Join Split
    </button>
  );
}
