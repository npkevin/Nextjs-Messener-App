import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "@/pages/index";

jest.mock("next/config", () => () => ({
    publicRuntimeConfig: {
        SOCKETIO_URI: "https://webdev.kevnp.com",
    },
}));

describe("Home", () => {
    it("renders both components", () => {
        render(<Home />);

        const side_menu = screen.getByTestId("side_menu");
        const messenger_view = screen.getByTestId("messenger_view");
        expect(side_menu).toBeInTheDocument();
        expect(messenger_view).toBeInTheDocument();
    });
});
