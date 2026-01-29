import { push, ref, set } from "firebase/database";
import { auth, db } from "./firebase";

export default function CreateSplit() {
  const submit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;

    const splitRef = push(ref(db, "splits"));

    await set(splitRef, {
      name,
      createdAt: Date.now(),
      createdBy: auth.currentUser.uid,
      members: {
        [auth.currentUser.uid]: {
          name: auth.currentUser.displayName,
          email: auth.currentUser.email,
        },
      },
      expenses: {},
    });

    e.target.reset();

    alert(
      `Split created!\n\nShare this link:\n${window.location.origin}/split/${splitRef.key}`,
    );
  };

  return (
    <form onSubmit={submit} className="card p-3 mb-3">
      <h5>Create Split</h5>

      <input
        name="name"
        className="form-control mb-2"
        placeholder="Split name (any purpose)"
        required
      />

      <button className="btn btn-primary w-100">Create Split</button>
    </form>
  );
}
