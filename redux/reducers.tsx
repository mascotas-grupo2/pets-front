import { combineReducers } from "@reduxjs/toolkit";
import { Pet } from "@/types/pet";
import { User } from "@/types/user";

// Define a union type for all possible actions
export type AppAction =
  | { type: "pets/ReportPet"; payload: object }
  | { type: "user/SetUser"; payload: User }
  | { type: "pets/all_pets"; payload: Pet[] }
  | { type: "pets/pet"; payload: Pet }
  | { type: "user/setFormAdoption"; payload: Record<string, unknown> }
  | { type: "user/Logout" };
const initialUserState: User = {
  isLoggedIn: false,
  name: "",
  adopter: false,
  role: "",
  signature: "",
};

const userReducer = (state = initialUserState, action: AppAction): User => {
  switch (action.type) {
    case "user/SetUser": // Use the specific action type
      return {
        isLoggedIn: true,
        name: action.payload.name,
        adopter: action.payload.adopter,
        role: action.payload.role,
        signature: action.payload.signature,
      };
    case "user/Logout":
      return initialUserState;
    default:
      return state;
  }
};

const initialReportState: object = {};
const reportReducer = (state = initialReportState, action: AppAction) => {
  switch (action.type) {
    case "pets/ReportPet":
      return action.payload;
    case "user/setFormAdoption":
      return action.payload;
    default:
      return state;
  }
};

const initialAllPetsState: Pet[] = [];
const allPetsReducer = (
  state = initialAllPetsState,
  action: AppAction,
): Pet[] => {
  switch (action.type) {
    case "pets/all_pets":
      return action.payload;
    default:
      return state;
  }
};

const initialPetState: Pet | null = null;
const petReducer = (state = initialPetState, action: AppAction): Pet | null => {
  switch (action.type) {
    case "pets/pet":
      return action.payload;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  user: userReducer,
  report_pet: reportReducer,
  allPets: allPetsReducer,
  pet: petReducer,
});

export default rootReducer;
