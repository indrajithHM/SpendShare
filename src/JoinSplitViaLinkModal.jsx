import { ref, set, get } from "firebase/database";
import { auth, db } from "./firebase";
import { useState } from "react";

export default function JoinSplitViaLinkModal({ onClose }) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const extractSplitId = (input) => {
    // works for:
    // https://domain.com/split/ABC123
    // /split/ABC123
    // ABC123
    const match = input.match(/split\/([^/]+)/);
    return match ? match[1] : input.trim();
  };

  const joinSplit = async () => {
    setError("");
    setLoading(true);

    try {
      const splitId = extractSplitId(link);

      if (!splitId) {
        setError("Invalid split link");
        return;
      }

      const splitRef = ref(db, `splits/${splitId}`);
      const snap = await get(splitRef);

      if (!snap.exists()) {
        setError("Split not found");
        return;
      }

      await set(
        ref(db, `splits/${splitId}/members/${auth.currentUser.uid}`),
        {
          name: auth.currentUser.displayName,
          email: auth.currentUser.email
        }
      );

      onClose(); // close modal → home already visible
    } catch (e) {
      setError("Failed to join split");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Join Split via Link</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <input
              className="form-control mb-2"
              placeholder="Paste split link or ID"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />

            {error && <div className="text-danger small">{error}</div>}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={joinSplit}
              disabled={loading}
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
