import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { reducer } from "./store";

export const makeStore = (preloadedState) => configureStore({ reducer, preloadedState });

// Membuat state penuh: state awal tiap slice digabung dengan patch parsial per slice.
export const stateWith = (patch = {}) => {
  const base = makeStore().getState();
  return Object.fromEntries(
    Object.entries(base).map(([key, slice]) => [key, { ...slice, ...patch[key] }]),
  );
};

export function renderWithProviders(ui, { route = "/", preloadedState } = {}) {
  const store = makeStore(preloadedState);
  const view = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>,
  );
  return { store, ...view };
}
