/** Serializable state for the account-deletion request form (shared by the action and the client). */
export type DeletionState = {
  status: "idle" | "requested" | "error";
  message?: string;
};

export const INITIAL_DELETION_STATE: DeletionState = { status: "idle" };
