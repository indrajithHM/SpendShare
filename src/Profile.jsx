import { useEffect, useState } from "react";
import { ref, get, update, runTransaction } from "firebase/database";
import { updateProfile } from "firebase/auth";
import { db } from "./firebase";

export default function Profile({ user }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const [initialName, setInitialName] = useState("");
  const [initialUsername, setInitialUsername] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  /* Load profile */
  useEffect(() => {
    if (!user) return;

    const currentName = user.displayName || "";
    setName(currentName);
    setInitialName(currentName);

    const userRef = ref(db, `users/${user.uid}`);
    get(userRef).then((snap) => {
      const dbUsername = snap.exists() ? snap.val().username || "" : "";
      setUsername(dbUsername);
      setInitialUsername(dbUsername);
      setLoading(false);
    });
  }, [user]);

  if (!user || loading) {
    return <div className="text-center mt-5 text-muted">Loading profile…</div>;
  }

  const isFirstTime = !initialUsername;
  const isDirty = name !== initialName || username !== initialUsername;

  /* Save profile */
  const saveProfile = async () => {
    if (!username || username.length < 3) {
      setMessage("Username must be at least 3 characters");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // 1️⃣ Update name
      if (name !== initialName) {
        await updateProfile(user, { displayName: name });
      }

      // 2️⃣ Reserve username ONLY first time
      if (!initialUsername) {
        const usernameRef = ref(db, `usernames/${username}`);

        const result = await runTransaction(usernameRef, (current) => {
          if (current === null) return user.uid;
          return; // abort
        });

        if (!result.committed) {
          setMessage("Username already taken");
          setSaving(false);
          return;
        }
      }

      // 3️⃣ Save to user profile
      await update(ref(db, `users/${user.uid}`), { username });

      setInitialName(name);
      setInitialUsername(username);
      setMessage("Profile saved successfully");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 480 }}>
      <h4 className="mb-3">
        <button
          className="btn btn-outline-secondary btn-sm px-2 me-2"
          onClick={() => window.history.back()}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        {isFirstTime ? "Complete your profile" : "Edit profile"}
      </h4>

      {isFirstTime && (
        <div className="alert alert-warning">
          Please complete your profile to continue.
        </div>
      )}

      {/* Avatar */}
      <div className="text-center mb-3">
        <img
          src={
            user.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.displayName || "User",
            )}`
          }
          className="rounded-circle mb-2"
          width={96}
          height={96}
          alt="avatar"
        />
        <small className="text-muted d-block">
          Profile picture is synced from your Google account.
        </small>
      </div>

      {/* Username */}
      <div className="mb-3">
        <label className="form-label">Username</label>
        <input
          className="form-control"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={!!initialUsername}
        />
        {initialUsername && (
          <small className="text-muted">
            Username cannot be changed once set.
          </small>
        )}
      </div>

      {/* Name */}
      <div className="mb-3">
        <label className="form-label">Full name</label>
        <input
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Email */}
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          className="form-control bg-light"
          value={user.email || ""}
          readOnly
        />
      </div>

      {/* Save */}
      <button
        className={`btn w-100 ${
          saving || !isDirty ? "btn-secondary" : "btn-success"
        }`}
        onClick={saveProfile}
        disabled={saving || !isDirty}
      >
        {saving ? "Saving…" : "Save profile"}
      </button>

      {message && <div className="text-center mt-3 small">{message}</div>}
    </div>
  );
}
