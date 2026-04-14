"use client";
import { useEffect, useState } from "react";
import { onValue, ref, set, remove } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { DEFAULT_CATEGORIES, Category } from "@/lib/categories";

export function useUserCategories() {
  const [userCats, setUserCats] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!auth.currentUser) return;
    const r = ref(db, `userCategories/${auth.currentUser.uid}`);
    return onValue(r, (snap) => {
      setUserCats(snap.exists() ? snap.val() : {});
    });
  }, []);

  const allCategories: Category[] = [
    ...DEFAULT_CATEGORIES.map((c) => ({
      key: c.key,
      icon: c.icon,
      color: c.color,
      budget: userCats[c.key]?.budget ?? null,
      isDefault: true,
    })),
    ...Object.entries(userCats)
      .filter(([key]) => !DEFAULT_CATEGORIES.some((d) => d.key === key))
      .map(([key, val]) => ({
        key,
        icon: val.icon,
        budget: val.budget ?? null,
        isDefault: false,
      })),
  ];

  const categoryExists = (name: string) =>
    allCategories.some((c) => c.key.toLowerCase() === name.toLowerCase());

  const addCategory = async (name: string, icon: string) => {
    if (categoryExists(name)) throw new Error("Category already exists");
    await set(ref(db, `userCategories/${auth.currentUser!.uid}/${name}`), { icon });
  };

  const updateIcon = async (name: string, icon: string) => {
    await set(ref(db, `userCategories/${auth.currentUser!.uid}/${name}/icon`), icon);
  };

  const updateBudget = async (name: string, budget: number) => {
    await set(ref(db, `userCategories/${auth.currentUser!.uid}/${name}/budget`), budget);
  };

  const deleteCategory = async (name: string) => {
    await remove(ref(db, `userCategories/${auth.currentUser!.uid}/${name}`));
  };

  return { allCategories, addCategory, updateIcon, updateBudget, deleteCategory, categoryExists };
}
