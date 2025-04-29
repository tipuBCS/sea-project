// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from "react";
import { Box, SpaceBetween } from "@cloudscape-design/components";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  verticalCenter?: boolean;
  description: string;
  action?: React.ReactNode;
}

const title = "No widgets";
const description = "There are no widgets on the dashboard.";
const verticalCenter = true;
const action = {};
//   <SpaceBetween direction="horizontal" size="xs">
//     <Button onClick={() => {}}>Reset to default layout</Button>
//     <Button iconName="add-plus" onClick={() => {}}>
//       Add widget
//     </Button>
//   </SpaceBetween>
// }

export const EmptyState = () => (
  <div className={""}>
    <Box
      margin={{ vertical: "xs" }}
      textAlign="center"
      color="text-body-secondary"
    >
      <SpaceBetween size="xxs">
        <div>
          <Box variant="strong" color="inherit">
            {title}
          </Box>
          <Box variant="p" color="inherit">
            {description}
          </Box>
        </div>
      </SpaceBetween>
    </Box>
  </div>
);
