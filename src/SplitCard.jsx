import { useNavigate } from "react-router-dom";

export default function SplitCard({ split }) {
  const navigate = useNavigate();

  if (!split || !split.id) return null;

  const link = `${window.location.origin}/split/${split.id}`;

  const handleShare = async (e) => {
    e.stopPropagation(); // prevent opening split

    // ✅ Native share (mobile / supported browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SpendShare Split",
          text: `Join my split: ${split.name}`,
          url: link
        });
      } catch (err) {
        // user cancelled share – ignore
      }
    } else {
      // ❌ Fallback
      await navigator.clipboard.writeText(link);
      alert("Link copied to clipboard");
    }
  };

  return (
    <div
      className="card p-3 mb-2 d-flex justify-content-between align-items-center"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/split/${split.id}`)}
    >
      <div>
        <strong>{split.name}</strong>
        <br />
        <small className="text-muted">
          {Object.keys(split.members || {}).length} members
        </small>
      </div>

      <button
        className="btn btn-outline-primary btn-sm"
        onClick={handleShare}
      >
        <i className="bi bi-share"></i>
      </button>
    </div>
  );
}
