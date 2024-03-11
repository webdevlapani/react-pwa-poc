import {
  Cancel,
  ContentCopy,
  DeleteRounded,
  Done,
  EditRounded,
  LaunchRounded,
  Pause,
  PlayArrow,
  PushPinRounded,
  RadioButtonChecked,
  RecordVoiceOver,
  RecordVoiceOverRounded,
} from "@mui/icons-material";
import {
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tab,
} from "@mui/material";
import { BottomSheet } from "react-spring-bottom-sheet";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import styled from "@emotion/styled";
import "react-spring-bottom-sheet/dist/style.css";
import { useResponsiveDisplay } from "../hooks/useResponsiveDisplay";
import { ColorPalette } from "../styles";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { UserContext } from "../contexts/UserContext";
import { Task, UUID } from "../types/user";
import { calculateDateDifference, formatDate } from "../utils";
import Marquee from "react-fast-marquee";

interface TaskMenuProps {
  selectedTaskId: UUID | null;
  selectedTasks: UUID[];
  setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  anchorEl: null | HTMLElement;
  handleDeleteTask: () => void;
  handleCloseMoreMenu: () => void;
  handleSelectTask: (taskId: UUID) => void;
}

export const TaskMenu: React.FC<TaskMenuProps> = ({
  selectedTaskId,
  selectedTasks,
  setEditModalOpen,
  anchorEl,
  handleDeleteTask,
  handleCloseMoreMenu,
  handleSelectTask,
}) => {
  const { user, setUser } = useContext(UserContext);
  const { tasks, settings, emojisStyle } = user;
  const isMobile = useResponsiveDisplay();
  const n = useNavigate();

  const redirectToTaskDetails = () => {
    const selectedTask = tasks.find((task) => task.id === selectedTaskId);
    const taskId = selectedTask?.id.toString().replace(".", "");
    n(`/task/${taskId}`);
  };

  const handleMarkAsDone = () => {
    // Toggles the "done" property of the selected task
    if (selectedTaskId) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTaskId) {
          return { ...task, done: !task.done };
        }
        return task;
      });
      setUser((prevUser) => ({
        ...prevUser,
        tasks: updatedTasks,
      }));

      const allTasksDone = updatedTasks.every((task) => task.done);

      if (allTasksDone) {
        toast.success(
          (t) => (
            <div onClick={() => toast.dismiss(t.id)}>
              <b>All tasks done</b>
              <br />
              <span>You've checked off all your todos. Well done!</span>
            </div>
          ),
          {
            icon: <Emoji unified="1f60e" emojiStyle={emojisStyle} />,
          }
        );
      }
    }
  };

  const handlePin = () => {
    // Toggles the "pinned" property of the selected task
    if (selectedTaskId) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTaskId) {
          return { ...task, pinned: !task.pinned };
        }
        return task;
      });
      setUser((prevUser) => ({
        ...prevUser,
        tasks: updatedTasks,
      }));
    }
  };

  const handleDuplicateTask = () => {
    if (selectedTaskId) {
      // Close the menu
      handleCloseMoreMenu();
      // Find the selected task
      const selectedTask = tasks.find((task) => task.id === selectedTaskId);
      if (selectedTask) {
        // Create a duplicated task with a new ID and current date
        const duplicatedTask: Task = {
          ...selectedTask,
          id: crypto.randomUUID(),
          date: new Date(),
          lastSave: undefined,
        };
        // Add the duplicated task to the existing tasks
        const updatedTasks = [...tasks, duplicatedTask];
        // Update the user object with the updated tasks
        setUser((prevUser) => ({
          ...prevUser,
          tasks: updatedTasks,
        }));
      }
    }
  };

  const handleReadAloud = () => {
    const selectedTask = tasks.find((task) => task.id === selectedTaskId);
    const voices = window.speechSynthesis.getVoices();
    const voiceName = voices.find((voice) => voice.name === settings[0].voice);
    const voiceVolume = settings[0].voiceVolume;
    const taskName = selectedTask?.name || "";
    const taskDescription = selectedTask?.description || "";
    const taskDate = formatDate(new Date(selectedTask?.date || ""));
    const taskDeadline = selectedTask?.deadline
      ? ". Task Deadline: " + calculateDateDifference(new Date(selectedTask.deadline) || "")
      : "";

    const textToRead = `${taskName}. ${taskDescription}. Date: ${taskDate}${taskDeadline}`;

    const utterThis: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(textToRead);

    if (voiceName) {
      utterThis.voice = voiceName;
    }

    if (voiceVolume) {
      utterThis.volume = voiceVolume;
    }

    handleCloseMoreMenu();
    const pauseSpeech = () => {
      window.speechSynthesis.pause();
    };

    const resumeSpeech = () => {
      window.speechSynthesis.resume();
    };

    const cancelSpeech = () => {
      window.speechSynthesis.cancel();
      toast.dismiss(SpeechToastId);
      handleCloseMoreMenu();
    };

    const SpeechToastId = toast(
      () => {
        const [isPlaying, setIsPlaying] = useState<boolean>(true);
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              touchAction: "none",
            }}
          >
            <span
              translate="yes"
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontWeight: 600,
                gap: "6px",
              }}
            >
              <RecordVoiceOver /> Read aloud: <span translate="no">{selectedTask?.name}</span>
            </span>
            <span translate="yes" style={{ marginTop: "10px", fontSize: "16px" }}>
              Voice: <span translate="no">{utterThis.voice?.name || "Default"}</span>
            </span>
            <div translate="no">
              <Marquee delay={0.6} play={isPlaying}>
                <p style={{ margin: "6px 0" }}>{utterThis.text} &nbsp;</p>
              </Marquee>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "16px",
                gap: "8px",
              }}
            >
              {isPlaying ? (
                <IconButton
                  sx={{ color: "white" }}
                  onClick={() => {
                    pauseSpeech();
                    setIsPlaying(!isPlaying);
                  }}
                >
                  <Pause fontSize="large" />
                </IconButton>
              ) : (
                <IconButton
                  sx={{ color: "white" }}
                  onClick={() => {
                    resumeSpeech();
                    setIsPlaying(!isPlaying);
                  }}
                >
                  <PlayArrow fontSize="large" />
                </IconButton>
              )}

              <IconButton sx={{ color: "white" }} onClick={cancelSpeech}>
                <Cancel fontSize="large" />
              </IconButton>
            </div>
          </div>
        );
      },
      {
        duration: 999999999,
        style: {
          border: "1px solid #1b1d4eb7",
          WebkitBackdropFilter: "blur(10px)",
          backdropFilter: "blur(10px)",
        },
      }
    );

    // Set up event listener for the end of speech
    utterThis.onend = () => {
      // Close the menu
      handleCloseMoreMenu();
      // Hide the toast when speech ends
      toast.dismiss(SpeechToastId);
    };
    console.log(utterThis);
    if (voiceVolume > 0) {
      window.speechSynthesis.speak(utterThis);
    }
  };

  const menuItems: JSX.Element = (
    <div>
      <StyledMenuItem
        onClick={() => {
          handleCloseMoreMenu();
          handleMarkAsDone();
        }}
      >
        <Done /> &nbsp;{" "}
        {tasks.find((task) => task.id === selectedTaskId)?.done
          ? "Mark as not done"
          : "Mark as done"}
      </StyledMenuItem>
      <StyledMenuItem
        onClick={() => {
          handleCloseMoreMenu();
          handlePin();
        }}
      >
        <PushPinRounded sx={{ textDecoration: "line-through" }} />
        &nbsp; {tasks.find((task) => task.id === selectedTaskId)?.pinned ? "Unpin" : "Pin"}
      </StyledMenuItem>

      {selectedTasks.length === 0 && (
        <StyledMenuItem onClick={() => handleSelectTask(selectedTaskId || crypto.randomUUID())}>
          <RadioButtonChecked /> &nbsp; Select
        </StyledMenuItem>
      )}

      <StyledMenuItem onClick={redirectToTaskDetails}>
        <LaunchRounded /> &nbsp; Task details
      </StyledMenuItem>

      {settings[0].enableReadAloud && (
        <StyledMenuItem
          onClick={handleReadAloud}
          disabled={window.speechSynthesis.speaking || window.speechSynthesis.pending}
        >
          <RecordVoiceOverRounded /> &nbsp; Read Aloud
        </StyledMenuItem>
      )}

      <Divider />
      <StyledMenuItem
        onClick={() => {
          handleCloseMoreMenu();
          setEditModalOpen(true);
        }}
      >
        <EditRounded /> &nbsp; Edit
      </StyledMenuItem>
      <StyledMenuItem onClick={handleDuplicateTask}>
        <ContentCopy /> &nbsp; Duplicate
      </StyledMenuItem>
      <Divider />
      <StyledMenuItem
        clr={ColorPalette.red}
        onClick={() => {
          handleCloseMoreMenu();
          handleDeleteTask();
        }}
      >
        <DeleteRounded /> &nbsp; Delete
      </StyledMenuItem>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <BottomSheet
          open={Boolean(anchorEl)}
          onDismiss={handleCloseMoreMenu}
          snapPoints={({ minHeight, maxHeight }) => [minHeight, maxHeight]}
          expandOnContentDrag
          header={
            <SheetHeader>
              <Emoji
                emojiStyle={emojisStyle}
                size={32}
                unified={tasks.find((task) => task.id === selectedTaskId)?.emoji || ""}
              />{" "}
              {emojisStyle === EmojiStyle.NATIVE && "\u00A0 "}
              {tasks.find((task) => task.id === selectedTaskId)?.name}
            </SheetHeader>
          }
        >
          <SheetContent>{menuItems}</SheetContent>
        </BottomSheet>
      ) : (
        <Menu
          id="task-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMoreMenu}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: "18px",
              minWidth: "200px",
              boxShadow: "none",
              padding: "6px 4px",
            },
          }}
          MenuListProps={{
            "aria-labelledby": "more-button",
          }}
        >
          {menuItems}
        </Menu>
      )}
    </>
  );
};

const SheetHeader = styled.h3`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  color: ${ColorPalette.fontDark};
  margin: 10px;
  font-size: 20px;
`;

const SheetContent = styled.div`
  color: ${ColorPalette.fontDark};
  margin: 20px 10px;
  & .MuiMenuItem-root {
    font-size: 16px;
    padding: 16px;
    &::before {
      content: "";
      display: inline-block;
      margin-right: 10px;
    }
  }
`;
const StyledMenuItem = styled(MenuItem)<{ clr?: string }>`
  margin: 0 6px;
  padding: 12px;
  border-radius: 12px;
  box-shadow: none;
  gap: 2px;
  color: ${({ clr }) => clr || ColorPalette.fontDark};

  &:hover {
    background-color: #f0f0f0;
  }
`;

const StyledTab = styled(Tab)`
  border-radius: 12px 12px 0 0;
  width: 50%;
  .MuiTabs-indicator {
    border-radius: 24px;
  }
`;
StyledTab.defaultProps = {
  iconPosition: "start",
};
