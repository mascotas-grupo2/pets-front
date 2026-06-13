export type PetComment = {
  id: string;
  petId: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  /** "pending" | "approved" | "rejected" */
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};
