import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Switch,
} from "@mui/material";
import type { AppSettings } from "../types/user";
import { DialogBtn } from "../styles";
import styled from "@emotion/styled";
import { UserContext } from "../contexts/UserContext";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsProps> = ({ open, onClose }) => {
  const { user, setUser } = useContext(UserContext);
  const { settings, } = user;
  const [userSettings, setUserSettings] = useState<AppSettings>(settings[0]);

  // Handler for updating individual setting options
  const handleSettingChange =
    (name: keyof AppSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
      // cancel read aloud
      name === "enableReadAloud" && window.speechSynthesis.cancel();
      const updatedSettings = {
        ...userSettings,
        [name]: event.target.checked,
      };
      setUserSettings(updatedSettings);
      setUser((prevUser) => ({
        ...prevUser,
        settings: [updatedSettings],
      }));
    };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontWeight: 600 }}>Settings</DialogTitle>
      <Container>
        <FormGroup>
          <StyledFormLabel
            sx={{ opacity: userSettings.enableGlow ? 1 : 0.8 }}
            control={
              <Switch
                checked={userSettings.enableGlow}
                onChange={handleSettingChange("enableGlow")}
              />
            }
            label="Enable Glow Effect"
          />
        </FormGroup>
        <FormGroup>
          <StyledFormLabel
            sx={{ opacity: userSettings.doneToBottom ? 1 : 0.8 }}
            control={
              <Switch
                checked={userSettings.doneToBottom}
                onChange={handleSettingChange("doneToBottom")}
              />
            }
            label="Move Done Tasks To Bottom"
          />
        </FormGroup>
      </Container>
      <DialogActions>
        <DialogBtn onClick={onClose}>Close</DialogBtn>
      </DialogActions>
    </Dialog>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: left;
  align-items: left;
  flex-direction: column;
  user-select: none;
  margin: 0 18px;
  gap: 6px;
`;

const StyledFormLabel = styled(FormControlLabel)`
  max-width: 300px;
`;



