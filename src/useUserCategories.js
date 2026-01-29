import { useEffect, useState } from "react";
import { onValue, ref, set, remove } from "firebase/database";
import { auth, db } from "./firebase";
import { DEFAULT_CATEGORIES } from "./categories";

export function useUserCategories() {
  const [userCats, setUserCats] = useState({});

  useEffect(() => {
    if (!auth.currentUser) return;

    const r = ref(db, `userCategories/${auth.currentUser.uid}`);
    return onValue(r, snap => {
      setUserCats(snap.exists() ? snap.val() : {});
    });
  }, []);

  /* ---------- MERGED CATEGORY LIST ---------- */
  const allCategories = [
    ...DEFAULT_CATEGORIES.map(c => ({
      key: c.key,
      icon: c.icon,
      color: c.color,
      budget: userCats[c.key]?.budget ?? null,
      isDefault: true
    })),
    ...Object.entries(userCats)
      .filter(([key]) =>
        !DEFAULT_CATEGORIES.some(d => d.key === key)
      )
      .map(([key, val]) => ({
        key,
        icon: val.icon,
        budget: val.budget ?? null,
        isDefault: false
      }))
  ];

  /* ---------- PREVENT DUPLICATES ---------- */
  const categoryExists = (name) =>
    allCategories.some(
      c => c.key.toLowerCase() === name.toLowerCase()
    );

  /* ---------- ADD ---------- */
  const addCategory = async (name, icon) => {
    if (categoryExists(name)) {
      throw new Error("Category already exists");
    }

    await set(
      ref(db, `userCategories/${auth.currentUser.uid}/${name}`),
      { icon }
    );
  };

  /* ---------- EDIT ICON ---------- */
  const updateIcon = async (name, icon) => {
    await set(
      ref(db, `userCategories/${auth.currentUser.uid}/${name}/icon`),
      icon
    );
  };

  /* ---------- SET BUDGET ---------- */
  const updateBudget = async (name, budget) => {
    await set(
      ref(db, `userCategories/${auth.currentUser.uid}/${name}/budget`),
      Number(budget)
    );
  };

  /* ---------- DELETE (SAFE) ---------- */
  const deleteCategory = async (name) => {
    await remove(
      ref(db, `userCategories/${auth.currentUser.uid}/${name}`)
    );
  };

  return {
    allCategories,
    addCategory,
    updateIcon,
    updateBudget,
    deleteCategory,
    categoryExists
  };
}
