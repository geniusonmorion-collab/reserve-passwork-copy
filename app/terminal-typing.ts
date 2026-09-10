// A terminal session: varied keystroke cadence, pauses at arguments, then a
// password pasted from the clipboard. Output is emitted by the CLI, not typed.
export const TERMINAL_COMMANDS = [
  "passwork-cli update \\",
  '--password-id "db-production" \\',
  '--password "••••••••••••••••"',
] as const;

export type TerminalFrame = {
  at: number;
  lines: [string, string, string];
  caretLine: number;
  phase: "typing" | "running" | "updated" | "logged" | "done" | "clearing";
};

export function makeTerminalTimeline() {
  const frames: TerminalFrame[] = [];
  let at = 0;
  const lines: [string, string, string] = ["", "", ""];
  const emit = (phase: TerminalFrame["phase"], caretLine = -1) => {
    frames.push({ at, lines: [...lines], caretLine, phase });
  };
  const cadence = [48, 71, 42, 58, 96, 53, 39, 65, 84, 46, 60, 43];
  emit("typing", 0);
  at += 820;

  TERMINAL_COMMANDS.forEach((command, line) => {
    if (line > 0) {
      at += line === 1 ? 340 : 470;
      emit("typing", line);
      at += 170;
    }
    for (let i = 0; i < command.length; i++) {
      // A password is pasted as one masked value, rather than 16 fake keystrokes.
      if (command[i] === "•") {
        at += 410;
        while (command[i + 1] === "•") i++;
      } else {
        at += cadence[(i + line * 5) % cadence.length];
        if (command[i] === " ") at += 110;
        if (command[i] === '"' && line === 1) at += 155;
      }
      lines[line] = command.slice(0, i + 1);
      emit("typing", line);
    }
    at += 210;
  });

  at += 380; // A short check of the finished command before Enter.
  emit("running");
  at += 780;
  emit("updated");
  at += 460;
  emit("logged");
  at += 320;
  emit("done");
  at += 4600; // Leave enough time to read the result before the quiet restart.
  emit("clearing");
  return { frames, duration: at + 360 };
}

export const TERMINAL_TIMELINE = makeTerminalTimeline();
export const TERMINAL_COMPLETE: TerminalFrame = {
  at: 0,
  lines: [...TERMINAL_COMMANDS],
  caretLine: -1,
  phase: "done",
};
