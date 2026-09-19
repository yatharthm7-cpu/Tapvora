"use client";

import { Trash2 } from "lucide-react";
import { deleteBusinessAction } from "@/app/dashboard/businesses/actions";

export function DeleteBusinessForm({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteBusinessAction} onSubmit={(event) => {
      if (!window.confirm(`Delete ${name}? Assigned cards will keep their current destination.`)) event.preventDefault();
    }}>
      <input type="hidden" name="id" value={id} />
      <button className="button button-danger" type="submit"><Trash2 size={16} /> Delete business</button>
    </form>
  );
}
