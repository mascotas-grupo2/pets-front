const initialState = {
  user: null,
};

const rootReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case "REPORT_PET":
      return { ...state, report_pet: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export default rootReducer;                                             