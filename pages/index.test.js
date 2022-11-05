import React from "react"
import { render } from "@testing-library/react";

import Home from "./index";

describe("home", () => {
  it("renders component", () => {
    render(<Home />);
  });
});
