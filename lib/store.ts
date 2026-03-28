import { create } from "zustand";

interface Table {
  id: string;
  position: [number, number, number];
  reserved: boolean;
}

interface Store {
  tables: Table[];
  setTables: (tables: Table[]) => void;
  reserveTable: (id: string) => void;
}

export const useStore = create<Store>((set) => ({
  tables: [],
  setTables: (tables) => set({ tables }),
  reserveTable: (id) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === id ? { ...t, reserved: true } : t
      ),
    })),
}));