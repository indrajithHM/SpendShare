import { useState } from "react";
import { DEFAULT_CATEGORIES } from "./categories";
import { useUserCategories } from "./useUserCategories";
import { CATEGORY_ICONS } from "./categoryIcons";
import BottomSheet from "./BottomSheet.jsx";

export default function CategoryGrid({ value, onChange, mode = "manage" }) {
  const {
    allCategories,
    addCategory,
    deleteCategory,
    updateIcon,
    updateBudget,
    categoryExists
  } = useUserCategories();

  /* ---------- ADD CATEGORY STATE ---------- */
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [newIcon, setNewIcon] = useState("bi-tag");

  /* ---------- EDIT CATEGORY STATE ---------- */
  const [editing, setEditing] = useState(null);
  const [editIcon, setEditIcon] = useState("");
  const [editBudget, setEditBudget] = useState("");

  const findDefaultMeta = key =>
    DEFAULT_CATEGORIES.find(c => c.key === key);

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">Category</label>

      {/* ================= CATEGORY GRID ================= */}
      <div className="row g-2">
        {allCategories.map(cat => {
          const key = cat.key;
          const defaultMeta = findDefaultMeta(key);
          const selected = value === key;

          const iconClass =
            cat.icon || defaultMeta?.icon || "bi-tag";

          const colorClass =
            selected ? "text-white" : defaultMeta?.color || "";

          return (
            <div className="col-4" key={key}>
              <button
                type="button"
                className={`btn w-100 position-relative d-flex flex-column align-items-center justify-content-center
                  ${selected ? "btn-primary" : "btn-outline-secondary"}`}
                style={{ height: mode === "select" ? 72 : 90 }}
                onClick={() => onChange(key)}
              >
                {/* EDIT ICON — manage mode only */}
                {mode === "manage" && (
                  <span
                    className="position-absolute top-0 end-0 m-1"
                    style={{ cursor: "pointer" }}
                    title="Edit"
                    onClick={e => {
                      e.stopPropagation();
                      setEditing(cat);
                      setEditIcon(cat.icon ?? "");
                      setEditBudget(
                        cat.budget !== null && cat.budget !== undefined
                          ? String(cat.budget)
                          : ""
                      );
                    }}
                  >
                    <i className="bi bi-pencil fs-6 text-muted" />
                  </span>
                )}

                <i className={`bi ${iconClass} fs-6 mb-1 ${colorClass}`} />
                <small className={selected ? "text-white" : ""}>
                  {key}
                </small>
              </button>

              {/* DELETE — custom categories only */}
              {mode === "manage" && !cat.isDefault && (
                <div className="d-flex justify-content-center mt-1">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Delete"
                    onClick={async () => {
                      if (!window.confirm(`Delete "${key}" category?`)) return;
                      await deleteCategory(key);
                      if (value === key) onChange("Others");
                    }}
                  >
                    <i className="bi bi-trash fs-6" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* ADD CATEGORY TILE — manage mode only */}
        {mode === "manage" && (
          <div className="col-4">
            <button
              type="button"
              className="btn btn-outline-primary w-100 d-flex flex-column align-items-center justify-content-center"
              style={{ height: 90 }}
              onClick={() => setShowAdd(true)}
            >
              <i className="bi bi-plus-circle fs-6 mb-1" />
              <small>Add</small>
            </button>
          </div>
        )}
      </div>

      {/* ================= ADD CATEGORY (BOTTOM SHEET) ================= */}
      <BottomSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Category"
      >
        <label className="form-label">Category Name</label>
        <input
          className="form-control mb-3"
          placeholder="Eg: Gym"
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
        />

        <label className="form-label">Icon</label>
        <IconPicker value={newIcon} onChange={setNewIcon} />

        <button
          className="btn btn-primary w-100 mt-3"
          onClick={async () => {
            const name = newCat.trim();
            if (!name) return;

            if (categoryExists(name)) {
              alert("Category already exists");
              return;
            }

            await addCategory(name, newIcon);
            onChange(name);

            setNewCat("");
            setNewIcon("bi-tag");
            setShowAdd(false);
          }}
        >
          Save
        </button>
      </BottomSheet>

      {/* ================= EDIT CATEGORY (BOTTOM SHEET) ================= */}
      <BottomSheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.key ?? ""}`}
      >
        <label className="form-label">Icon</label>
        <IconPicker value={editIcon} onChange={setEditIcon} />

        <label className="form-label mt-3">
          Monthly Budget (₹)
        </label>
        <input
          type="number"
          className="form-control"
          placeholder="Optional"
          value={editBudget}
          onChange={e => setEditBudget(e.target.value)}
        />

        <button
          className="btn btn-primary w-100 mt-3"
          onClick={async () => {
            if (!editing) return;

            const updates = [];

            // ✅ Update icon only if changed
            if (
              editIcon &&
              editIcon !== editing.icon
            ) {
              updates.push(updateIcon(editing.key, editIcon));
            }

            // ✅ Update budget only if user entered something
            if (editBudget !== "") {
              updates.push(
                updateBudget(editing.key, Number(editBudget))
              );
            }

            // ✅ Nothing changed → just close
            if (updates.length === 0) {
              setEditing(null);
              return;
            }

            await Promise.all(updates);
            setEditing(null);
          }}
        >
          Save Changes
        </button>
      </BottomSheet>
    </div>
  );
}

/* ================= ICON PICKER ================= */

function IconPicker({ value, onChange }) {
  return (
    <div className="d-flex flex-wrap gap-2">
      {CATEGORY_ICONS.map(icon => (
        <button
          key={icon}
          type="button"
          className={`btn btn-sm ${
            value === icon ? "btn-primary" : "btn-outline-secondary"
          }`}
          onClick={() => onChange(icon)}
        >
          <i className={`bi ${icon} fs-6`} />
        </button>
      ))}
    </div>
  );
}
