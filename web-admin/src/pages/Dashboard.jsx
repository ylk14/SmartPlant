import React from "react";
import { Typography, Box } from "@mui/material";

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      <Typography>
        Welcome to the admin dashboard! Here you’ll see key stats and charts.
      </Typography>
    </Box>
  );
}
