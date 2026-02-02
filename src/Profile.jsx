import { useEffect, useState } from "react";
import { ref, get, update } from "firebase/database";
import { db } from "./firebase";
import { updateProfile } from "firebase/auth";

export default function Profile({ user }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!user) return;

    setName(user.displayName || "");

    const userRef = ref(db, `users/${user.uid}`);
    get(userRef).then((snap) => {
      if (snap.exists()) {
        setUsername(snap.val().username || "");
      }
      setLoading(false);
    });
  }, [user]);

  if (!user || loading) {
    return (
      <div className="text-center mt-5 text-muted">
        Loading profile…
      </div>
    );
  }

  const isFirstTime = !username;

  const saveProfile = async () => {
    if (!username || username.length < 3) {
      setMessage("Username must be at least 3 characters");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      await update(ref(db, `users/${user.uid}`), {
        username
      });

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
        {isFirstTime ? "Complete your profile" : "Edit profile"}
      </h4>

      {isFirstTime && (
        <div className="alert alert-warning">
          Please complete your profile to continue.
        </div>
      )}

     <div className="text-center mb-3">
  <img
    src={
      user.photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.displayName || "User"
      )}`
    }
    alt="avatar"
    className="rounded-circle mb-2"
    width={96}
    height={96}
  />

  <div>
    <small className="text-muted">
      Profile picture is synced from your Google account.
    </small>
  </div>
</div>
      <div className="mb-3">
        <label className="form-label">Username</label>
        <input
          className="form-control"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. indra_7"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Full name</label>
        <input
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
     
      
       <div className="mb-3">
  <label className="form-label">Email address</label>
  <input
    type="email"
    className="form-control"
    value={user.email || ""}
    disabled
  />
  <small className="text-muted">
    Email is linked to your Google account and cannot be changed here.
  </small>
</div>

      <button
        className="btn btn-success w-100"
        onClick={saveProfile}
        disabled={saving}
      >
        {saving ? "Saving…" : "Save profile"}
      </button>

      {message && (
        <div className="text-center mt-3 small">{message}</div>
      )}
    </div>
  );
}