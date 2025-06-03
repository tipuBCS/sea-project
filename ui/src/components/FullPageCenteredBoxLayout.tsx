import type { JSX } from "react";

export const FullPageCenteredBoxLayout = ({
  children,
  width,
  height,
}: {
  children: JSX.Element | JSX.Element[];
  width: number;
  height?: number;
}) => (
  <div
    style={{
      display: "flex",
      minHeight: "100vh",
      alignContent: "center",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        width: width,
      }}
    >
      {children}
    </div>
  </div>
);
