import {
  TopNavigation,
  TopNavigationProps,
} from "@cloudscape-design/components";
import { Mode } from "@cloudscape-design/global-styles";

type TopNavProps = {
  displayName?: string;
  mode: string;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  role?: string;
  logout: () => void;
};

const TopNav = ({ displayName, mode, setMode, role, logout }: TopNavProps) => {
  const topMenu = (
    username: string
  ): TopNavigationProps.MenuDropdownUtility => {
    return {
      type: "menu-dropdown",
      text: username,
      items: [{ id: "logout", text: "Sign out" }],

      onItemClick: (event) => {
        event.preventDefault();
        if (event.detail.id === "logout") {
          logout();
        }
      },
    };
  };

  return (
    <TopNavigation
      data-color="red"
      identity={{ title: "Kanban Board", href: "" }}
      utilities={[
        {
          type: "button",
          text: mode === Mode.Light ? "Dark" : "Light",
          onClick: () => setMode(mode === Mode.Light ? Mode.Dark : Mode.Light),
        },
        {
          type: "button",
          text: `Role: ${role || "undefined"}`,
        },
        topMenu(displayName || "undefined"),
      ]}
    ></TopNavigation>
  );
};

export default TopNav;
