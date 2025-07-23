import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UIState } from "@/types";

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isModalOpen: false,
      modalType: null,
      modalData: null,

      openModal: (type: UIState["modalType"], data = null) => {
        set((state) => ({
          ...state,
          isModalOpen: true,
          modalType: type,
          modalData: data,
        }));
      },

      closeModal: () => {
        set((state) => ({
          ...state,
          isModalOpen: false,
          modalType: null,
          modalData: null,
        }));
      },

      isDarkMode: false,
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
      skipHydration: true,
    },
  ),
);
