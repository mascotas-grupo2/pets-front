/**
 * `render` propio que envuelve el componente con el store de Redux.
 * Útil para componentes que usan `useAppSelector` / `useDispatch`.
 *
 * Uso:
 *   renderWithStore(<MiComponente />, { preloadedState: { user: makeUser() } });
 *
 * Re-exporta todo `@testing-library/react`, así los tests importan de un solo lugar.
 */
import { configureStore } from "@reduxjs/toolkit";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { Provider } from "react-redux";
import rootReducer from "@/redux/reducers";

type PreloadedState = Partial<ReturnType<typeof rootReducer>>;

export function makeStore(preloadedState?: PreloadedState) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as never,
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });
}

export function renderWithStore(
  ui: ReactElement,
  { preloadedState, ...options }: { preloadedState?: PreloadedState } & RenderOptions = {},
) {
  const store = makeStore(preloadedState);
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}

export * from "@testing-library/react";
