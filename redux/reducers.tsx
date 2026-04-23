import { User } from "@/types/login";
import { Pet } from "@/types/pet";
import { ReportForm } from "@/types/reportar";

interface State {
  user: User | null;
  report_pet?: ReportForm;
  allPets?: Pet[];
}

const initialState: State = {
  user: null,
};

type Action =
  | { type: "REPORT_PET"; payload: ReportForm }
  | { type: "SET_USER"; payload: User }
  | { type: "ALL_PETS"; payload: Pet[] };

const rootReducer = (state = initialState, action: Action): State => {
  switch (action.type) {
    case "REPORT_PET":
      return { ...state, report_pet: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload };
    case "ALL_PETS":
      return { ...state, allPets: action.payload };
    default:
      return state;
  }
};

export default rootReducer;
