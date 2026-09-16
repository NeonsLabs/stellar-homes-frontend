"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Field, { TextInput } from "@/components/ui/Field";

/** Open a mortgage by id: the only way to find one on-chain without an indexer. */
export default function MortgageLookup() {
  const router = useRouter();
  const [id, setId] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (id) router.push(`/mortgages/${id}`);
      }}
      className="flex items-end gap-2"
    >
      <div className="flex-1">
        <Field label="Mortgage id">
          {(fieldId) => (
            <TextInput
              id={fieldId}
              inputMode="numeric"
              placeholder="e.g. 1"
              value={id}
              onChange={(e) => setId(e.target.value.replace(/\D/g, ""))}
            />
          )}
        </Field>
      </div>
      <Button type="submit" variant="secondary" disabled={!id}>
        Open
      </Button>
    </form>
  );
}
