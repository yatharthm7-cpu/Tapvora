"use client";

import { Trash2 } from "lucide-react";
import { deleteAllCardsAction } from "@/app/dashboard/cards/actions";

export function DeleteAllCardsForm({ deletableCount, activeCount }: { deletableCount: number; activeCount: number }) {
  return (
    <form
      action={deleteAllCardsAction}
      onSubmit={(event) => {
        if (!window.confirm(`Permanently delete ${deletableCount} unused or inactive card${deletableCount === 1 ? "" : "s"}? ${activeCount} active card${activeCount === 1 ? "" : "s"} will be protected. Deleted links and analytics cannot be recovered.`)) {
          event.preventDefault();
        }
      }}
    >
      <button className="button button-danger" type="submit" disabled={!deletableCount}>
        <Trash2 size={16} /> {deletableCount ? "Delete non-active cards" : "Active cards protected"}
      </button>
    </form>
  );
}
