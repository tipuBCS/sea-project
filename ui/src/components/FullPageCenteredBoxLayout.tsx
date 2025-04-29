import { JSX } from "react";

export const FullPageCenteredBoxLayout = ({ children }: { children: JSX.Element | JSX.Element[] }) => (
  <div
    style={{
      display: 'flex',
      minHeight: '100vh',
      alignContent: 'center',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <div
      style={{
        width: 400,
        height: 400,
      }}
    >
      {children}
    </div>
  </div>
);
