import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";

test("renders app shell", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  // put something real that exists in your UI
  expect(screen.getByText(/Create Task/i)).toBeInTheDocument();
});
