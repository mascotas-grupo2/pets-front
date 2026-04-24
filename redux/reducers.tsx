import { User } from "@/types/login";
import { Pet } from "@/types/pet";
import { ReportForm } from "@/types/reportar";

interface State {
  user: User | null;
  report_pet?: ReportForm;
  allPets?: Pet[];
  pet?: Pet;
  adoptForm?: Record<string, unknown>;
}

const initialState: State = {
  user: null,
};

type Action =
  | { type: "pets/ReportPet"; payload: ReportForm }
  | { type: "user/SetUser"; payload: User }
  | { type: "pets/all_pets"; payload: Pet[] }
  | { type: "pets/pet"; payload: Pet }
  | { type: "user/setFormAdoption"; payload: Record<string, unknown> };

const rootReducer = (state = initialState, action: Action): State => {
  switch (action.type) {
    case "pets/ReportPet":
      return { ...state, report_pet: action.payload };
    case "user/SetUser":
      return { ...state, user: action.payload };
    case "pets/all_pets":
      return { ...state, allPets: action.payload };
    case "pets/pet":
      return { ...state, pet: action.payload };
    case "user/setFormAdoption":
      return { ...state, adoptForm: action.payload };
    default:
      return state;
  }
};

export default rootReducer;
