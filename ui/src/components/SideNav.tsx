import {
  SideNavigation,
  SideNavigationProps,
} from "@cloudscape-design/components";
import { JSX } from "react";

type SideNavProps = {
  userIdBoard: string;
  userId?: string;
  sideNavItems?: SideNavigationProps.Link[];
};

const SideNav = ({
  userIdBoard,
  userId,
  sideNavItems,
}: SideNavProps): JSX.Element => {
  return (
    <SideNavigation
      activeHref={userIdBoard}
      header={{
        href: userId || "undefined",
        text: "Your Board",
      }}
      items={[
        {
          type: "section-group",
          title: "Other Boards",
          items: [...(sideNavItems || [])],
        },
      ]}
    />
  );
};

export default SideNav;
