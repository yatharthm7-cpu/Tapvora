"use client";

import { Trash2 } from "lucide-react";
import { deleteAllCardsAction } from "@/app/dashboard/cards/actions";

export function DeleteAllCardsForm({ count }: { count: number }) {
  return (
    <form
      action={deleteAllCardsAction}
      onSubmit={(event) => {
        if (!window.confirm(`Permanently delete all ${count} cards? Their links and analytics will be removed. The next card will restart at TV-0001. This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <button className="button button-danger" type="submit">
        <Trash2 size={16} /> Delete all cards
      </button>
    </form>
  );
}
