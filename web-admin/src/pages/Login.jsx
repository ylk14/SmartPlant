import React from "react";
import { TextField, Button, Paper, Typography } from "@mui/material";

export default function Login() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper elevation={3} style={{ padding: "40px", width: "350px" }}>
        <Typography variant="h5" gutterBottom>Admin Login</Typography>
        <TextField fullWidth label="Email" margin="normal" />
        <TextField fullWidth label="Password" type="password" margin="normal" />
        <Button fullWidth variant="contained" color="success" style={{ marginTop: "20px" }}>
          Login
        </Button>
      </Paper>
    </div>
  );
}
