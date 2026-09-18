"use client";

import { Trash2 } from "lucide-react";
import { deleteCardAction } from "@/app/dashboard/cards/actions";

export function DeleteCardForm({ cardId, cardLabel }: { cardId: string; cardLabel: string }) {
  return (
    <form
      action={deleteCardAction}
      onSubmit={(event) => {
        if (!window.confirm(`Permanently delete ${cardLabel}? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={cardId} />
      <button className="button button-danger" type="submit">
        <Trash2 size={16} /> Delete card
      </button>
    </form>
  );
}
