"use client";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useUserCategories } from "@/hooks/useUserCategories";
import { CATEGORY_ICON_OPTIONS } from "@/lib/categories";
import { CategoryIcon } from "./CategoryIcon";
import BottomSheet from "./BottomSheet";

interface Props {
  value?: string | null;
  onChange: (cat: string) => void;
  mode?: "select" | "manage";
}

export default function CategoryGrid({ value, onChange, mode = "select" }: Props) {
  const { allCategories, addCategory, deleteCategory, updateIcon, updateBudget, categoryExists } = useUserCategories();

  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [newIcon, setNewIcon] = useState("Tag");
  const [editing, setEditing] = useState<any>(null);
  const [editIcon, setEditIcon] = useState("");
  const [editBudget, setEditBudget] = useState("");

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {allCategories.map((cat) => {
          const selected = value === cat.key;
          return (
            <div key={cat.key} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onChange(cat.key)}
                className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-2 transition-all border ${
                  selected
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                } ${mode === "manage" ? "pt-5" : ""}`}
                style={{ minHeight: mode === "select" ? 68 : 84 }}
              >
                {mode === "manage" && (
                  <span
                    className="absolute top-1.5 right-1.5 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(cat);
                      setEditIcon(cat.icon ?? "");
                      setEditBudget(cat.budget != null ? String(cat.budget) : "");
                    }}
                  >
                    <Pencil className="w-3 h-3 text-gray-400 hover:text-indigo-500" />
                  </span>
                )}
                <CategoryIcon name={cat.icon} className={`w-5 h-5 ${selected ? "text-white" : ""}`} />
                <span className={`text-[11px] font-medium truncate w-full text-center ${selected ? "text-white" : "text-gray-700"}`}>
                  {cat.key}
                </span>
              </button>
              {mode === "manage" && !cat.isDefault && (
                <button
                  className="flex items-center justify-center py-1 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                  onClick={async () => {
                    if (!confirm(`Delete "${cat.key}"?`)) return;
                    await deleteCategory(cat.key);
                    if (value === cat.key) onChange("Others");
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
          );
        })}

        {mode === "manage" && (
          <div>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="w-full flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
              style={{ minHeight: 84 }}
            >
              <Plus className="w-5 h-5" />
              <span className="text-[11px] font-medium">Add</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Category Sheet */}
      <BottomSheet open={showAdd} onClose={() => setShowAdd(false)} title="Add Category">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Category Name</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="e.g. Gym"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Icon</label>
            <IconPicker value={newIcon} onChange={setNewIcon} />
          </div>
          <button
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            onClick={async () => {
              const name = newCat.trim();
              if (!name) return;
              if (categoryExists(name)) { alert("Already exists"); return; }
              await addCategory(name, newIcon);
              onChange(name);
              setNewCat(""); setNewIcon("Tag"); setShowAdd(false);
            }}
          >
            Save Category
          </button>
        </div>
      </BottomSheet>

      {/* Edit Category Sheet */}
      <BottomSheet open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.key ?? ""}`}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Icon</label>
            <IconPicker value={editIcon} onChange={setEditIcon} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Monthly Budget (₹)</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Optional"
              value={editBudget}
              onChange={(e) => setEditBudget(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            onClick={async () => {
              if (!editing) return;
              const ops = [];
              if (editIcon && editIcon !== editing.icon) ops.push(updateIcon(editing.key, editIcon));
              if (editBudget !== "") ops.push(updateBudget(editing.key, Number(editBudget)));
              if (ops.length) await Promise.all(ops);
              setEditing(null);
            }}
          >
            Save Changes
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_ICON_OPTIONS.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          className={`p-2 rounded-xl border transition-all ${
            value === icon ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 text-gray-500 hover:border-indigo-300"
          }`}
        >
          <CategoryIcon name={icon} className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
}
