import { combineReducers } from "@reduxjs/toolkit";
import { UserState, User } from "@/types/user";
import { Pet } from "@/types/pet";

// Define a union type for all possible actions
export type AppAction =
  | { type: "pets/ReportPet"; payload: object }
  | { type: "user/SetUser"; payload: User }
  | { type: "pets/all_pets"; payload: Pet[] }
  | { type: "pets/pet"; payload: Pet }
  | { type: "user/setFormAdoption"; payload: Record<string, unknown> }
  | { type: "user/Logout" };
const initialUserState: UserState = {
  userId: 0,
  name: "",
  adopter: false,
  role: "",
};

const userReducer = (
  state = initialUserState,
  action: AppAction,
): UserState => {
  switch (action.type) {
    case "user/SetUser": // Use the specific action type
      return {
        ...state,
        userId: action.payload.id,
        name: action.payload.name,
        adopter: action.payload.adopter,
        role: action.payload.role,
      };
    case "user/Logout":
      return initialUserState;
    default:
      return state;
  }
};

// Placeholder reducers for other actions
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
  all_pets: allPetsReducer,
  petReducer,
});

export default rootReducer;
