import React from "react"
import { render } from "@testing-library/react";
import { act } from 'react-dom/test-utils';


import Home from "../../pages/index";

describe("home", () => {
  it("renders component", async () => {
    global.window.fetch = () => Promise.resolve({
      json: () => Promise.resolve([])
    })

    await act(() => {
      render(<Home />);
    });
  });
});
