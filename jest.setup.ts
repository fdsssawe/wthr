import React from "react";
import "@testing-library/jest-dom";

jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: React.ComponentProps<"img">) =>
        React.createElement("img", props),
}));

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
        React.createElement("a", rest, children),
}));
