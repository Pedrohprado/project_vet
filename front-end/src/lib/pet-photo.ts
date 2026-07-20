export type PetPhotoSelection = {
  file: File | null;
  /** When true in edit mode, removes the existing photo if no new file is selected. */
  removeExisting: boolean;
};

export function emptyPetPhotoSelection(): PetPhotoSelection {
  return { file: null, removeExisting: false };
}
