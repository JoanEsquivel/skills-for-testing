# Under the Hood: Bash Architecture and Process Model

## The Hook

When you type `ls -la` at a terminal and press Enter, at least three separate programs collaborate to show you the result: a terminal emulator, a shell, and the `ls` binary. Between them, the kernel manages pseudo-terminals, file descriptors, process groups, and signal delivery. Most developers --- and most AI agents --- never think about any of this. But understanding the layers beneath the prompt explains why bash behaves the way it does, why environment variables sometimes vanish, why background processes get killed when you close a terminal, and why AI agents need persistent sessions.

## Context: The Three Layers

Every terminal interaction involves three distinct components:

1. **Terminal Emulator** --- The application you see (iTerm2, Windows Terminal, GNOME Terminal, or even a browser tab for cloud shells). It draws characters on screen and captures keyboard input.
2. **Shell** --- The program that interprets your commands (bash, zsh, fish). It is just a user-space process --- nothing magical about it.
3. **Kernel (TTY Subsystem)** --- The operating system manages the pseudo-terminal (PTY) abstraction that bridges the terminal emulator and the shell. The PTY has a master side (owned by the terminal emulator) and a slave side (connected to the shell's stdin/stdout/stderr).

When you type a character, the terminal emulator writes it to the PTY master. The kernel's TTY driver delivers it to the shell process reading from the PTY slave. When the shell produces output, the reverse happens. The kernel sits between every keystroke and every line of output.

This architecture is why AI agents don't need a terminal emulator at all. Claude Code's bash tool connects directly to a shell process via pipes --- no PTY, no screen rendering. The model writes commands to stdin and reads from stdout/stderr. The terminal emulator layer is entirely unnecessary for programmatic interaction.

## Core Idea: How Bash Processes a Command

Bash operates as a pipeline that transforms user input into executed commands. According to Chet Ramey (the Bash maintainer), "data is passed through a number of stages, transformed at each step, until the shell finally executes a command." The stages are:

### 1. Input Processing

For interactive shells, Bash uses the readline library, which provides line editing, history search, and tab completion. This operates as a "basic read/dispatch/execute/redisplay loop." For non-interactive shells (scripts), input comes from a file or pipe with no readline involvement.

### 2. Parsing

The parser, built with Yacc/Bison, breaks input into tokens and constructs a command structure. This is one of Bash's most complex components because the same word can have different meanings depending on context. The lexical analyzer and parser share state extensively to resolve ambiguities.

### 3. Word Expansion

Multiple expansion stages occur sequentially, in this order:

1. Brace expansion (`{a,b,c}` becomes `a b c`)
2. Tilde expansion (`~` becomes `/home/user`)
3. Parameter/variable expansion (`$HOME`, `${var:-default}`)
4. Command substitution (`` `cmd` `` or `$(cmd)`)
5. Arithmetic expansion (`$((1 + 2))`)
6. Word splitting (using IFS delimiter)
7. Globbing/filename expansion (`*.py` matches Python files)

The order matters. Variables are expanded before word splitting, which is why unquoted `$var` with spaces produces multiple words.

### 4. Command Execution

Bash distinguishes two command types:
- **Builtin commands** (`cd`, `export`, `source`) run inside the shell process itself because they need to modify shell state.
- **External commands** (`ls`, `grep`, `python`) are executed via the fork/exec mechanism.

## Deep Dive: Fork, Exec, and Process Creation

Every external command Bash runs follows the fork-exec pattern:

**Fork:** The shell calls `fork()`, creating a child process that is an exact clone of the shell --- same code, same memory, same file descriptors, same environment variables. The only difference is the return value of `fork()`: the parent gets the child's PID, the child gets 0.

**Exec:** The child process immediately calls `execve()`, which replaces its entire memory image with the new program. The process ID stays the same, but the code, data, and stack are completely overwritten.

**Wait:** The parent shell calls `wait()` (for foreground commands) to block until the child exits, or continues immediately (for background commands with `&`).

This explains several behaviors that trip up both developers and AI agents:

- **Why `cd` is a builtin:** If `cd` were an external command, `fork()` would create a child, `exec()` would run `cd` in the child, the child's working directory would change, and then the child would exit. The parent shell's directory would never change. So `cd` must run inside the shell process.
- **Why environment changes in subshells don't propagate:** A subshell is a fork without exec. Changes to variables in the child are invisible to the parent because they have separate memory.
- **Why AI agent sessions must be persistent:** If each command ran in a separate shell process, `cd /project && npm test` would fail because the second command would not inherit the directory change. Claude Code's bash tool maintains a single persistent session for exactly this reason.

## File Descriptor Inheritance

When a process forks, the child inherits copies of all the parent's open file descriptors. These copies point to the same underlying file descriptions in the kernel, sharing file offsets and status flags. This is the mechanism behind I/O redirection:

```bash
# The shell opens output.txt on fd 1 (stdout) before exec'ing ls
ls -la > output.txt
```

What actually happens:
1. Shell forks a child
2. In the child (before exec), the shell closes fd 1 (stdout) and opens `output.txt` on fd 1
3. Child execs `ls`, which writes to fd 1 --- now pointing at the file, not the terminal
4. `ls` has no idea its output is going to a file; it just writes to stdout

This inheritance model is why Bash redirections compose cleanly. It is also why AI agent implementations must be careful about what file descriptors are open when spawning commands --- leaked descriptors can cause hangs or security issues.

## Signal Handling

Signals are the Unix mechanism for inter-process communication. Key signals include:

| Signal | Number | Default Action | Common Use |
|--------|--------|---------------|------------|
| SIGINT | 2 | Terminate | Ctrl+C |
| SIGTERM | 15 | Terminate | Polite shutdown request |
| SIGKILL | 9 | Terminate (cannot be caught) | Force kill |
| SIGHUP | 1 | Terminate | Terminal closed |
| SIGTSTP | 20 | Stop | Ctrl+Z |
| SIGCHLD | 17 | Ignore | Child process exited |

Bash's signal behavior follows specific rules:

- **Inherited handlers:** Non-builtin commands inherit the signal handlers that the shell inherited from its parent, unless `trap` sets them to be ignored.
- **Ignored signals stay ignored:** If a signal is set to SIG_IGN before exec, it remains ignored in the new process. This is how `nohup` works --- it sets SIGHUP to ignore before exec'ing the command.
- **Background processes:** When job control is not in effect, asynchronous (background) commands ignore SIGINT and SIGQUIT. This prevents Ctrl+C from killing background tasks.
- **After exec:** Handled signals (those with custom trap handlers) are reset to their default disposition after execve. The new program cannot inherit the shell's Bash function handlers.

For AI agents, signal handling matters in practical ways. If an agent starts a long-running process and the user cancels, SIGINT must reach the child process. If the agent's session is terminated, SIGHUP propagation determines whether spawned processes continue or die.

## Environment Variable Inheritance

Environment variables follow a strict parent-to-child inheritance model:

- Variables marked with `export` are copied into the child's environment during fork.
- Regular shell variables (not exported) are not passed to child processes.
- A child process cannot modify its parent's environment. Ever. This is a fundamental Unix constraint.

This asymmetry (parent to child, never child to parent) has profound implications:

```bash
# This does NOT work as expected:
my_script.sh   # Sets MY_VAR inside
echo $MY_VAR   # Empty --- the script ran in a child process

# This works:
source my_script.sh   # Runs in current shell (no fork)
echo $MY_VAR          # Has the value set by the script
```

The distinction matters enormously for AI agents. When Claude Code runs `export PATH=$PATH:/new/path`, the change persists because the bash session is persistent. But if an agent implementation spawns a new shell for each command, environment modifications vanish between calls.

## Subshells vs. Child Processes

These two concepts are frequently confused:

**Subshell:** Created by parentheses `( commands )` or pipes. It is a fork of the current shell without exec. The subshell inherits all shell variables (even non-exported ones), functions, aliases, and options. But changes in the subshell do not propagate back to the parent.

**Child process:** Created by running an external command or script. Uses fork followed by exec. Only exported environment variables are inherited --- regular shell variables, functions, and aliases are not visible.

```bash
VAR="hello"  # Not exported

# Subshell: sees VAR because it's a fork (copy of shell memory)
(echo $VAR)   # Prints "hello"

# Child process: does NOT see VAR because it's not exported
bash -c 'echo $VAR'   # Prints nothing
```

Pipes create subshells for each element in Bash (though this changed in Bash 4.2 with `lastpipe`). This is why:

```bash
# This does NOT work in Bash:
echo "value" | read MY_VAR
echo $MY_VAR   # Empty! read ran in a pipe subshell

# This works:
read MY_VAR <<< "value"
echo $MY_VAR   # "value"
```

## Login vs. Non-Login, Interactive vs. Non-Interactive

These four shell types determine which configuration files are read:

| Shell Type | Config Files Read |
|---|---|
| Interactive login | `/etc/profile`, then first of `~/.bash_profile`, `~/.bash_login`, `~/.profile` |
| Interactive non-login | `~/.bashrc` |
| Non-interactive | Only `$BASH_ENV` (if set) |
| Non-interactive login | `/etc/profile`, then first of `~/.bash_profile`, `~/.bash_login`, `~/.profile` |

**Login shell:** Invoked when you log into a system (SSH, console login, `bash --login`). Sets up the initial environment.

**Non-login shell:** Invoked when you open a new terminal window in a desktop environment or type `bash` in an existing shell.

**Interactive:** Connected to a terminal, reads input from the user, displays a prompt.

**Non-interactive:** Runs a script or command from `-c` flag, no prompt, no readline.

The best practice is to put all customizations in `~/.bashrc` and have `~/.bash_profile` source it. This ensures consistency across shell types.

For AI agents, this matters because:
- Claude Code's bash tool runs a non-interactive shell, so `~/.bashrc` is not sourced by default (unless BASH_ENV is set or the implementation explicitly sources it).
- CI/CD runners typically run non-interactive non-login shells, so PATH modifications in `~/.bash_profile` may not take effect.
- Docker containers may or may not run login shells depending on the entrypoint configuration.

## Practical Applications for AI Agent Developers

Understanding these internals helps when building or debugging AI agent systems:

1. **Persistent sessions are non-negotiable.** Fork/exec means environment changes in one command must carry forward. Spawn one bash process and keep it alive.

2. **Source, don't execute, for environment setup.** If your agent needs to load environment files, use `source .env` rather than running a script that sets variables.

3. **Handle large outputs.** Use targeted commands (`tail -100`, `grep pattern`) rather than dumping entire files. Understand that pipes create subshells, so avoid pipe-based variable assignment.

4. **Respect signal propagation.** If you kill an agent session, ensure spawned child processes are also cleaned up. Use process groups and `kill -- -$PGID` when necessary.

5. **Test shell availability.** Do not assume `/bin/bash` exists. Alpine containers have `/bin/sh` (ash). Use `command -v bash` to check.

## Conclusion

The architecture of Bash --- the parsing pipeline, the fork/exec model, the file descriptor inheritance, the environment variable rules --- is not just academic knowledge. It is the operational substrate on which AI agents execute. Every time Claude Code runs a command, it triggers fork, exec, wait, and cleanup. Every persistent variable depends on the session staying alive. Every I/O redirection relies on file descriptor inheritance across fork.

Understanding these mechanisms explains why agent architectures look the way they do: persistent sessions (because fork creates separate memory spaces), text-based communication (because pipes and fd inheritance work on byte streams), and sandbox boundaries (because fork inherits everything, including access to sensitive files).

The shell is not a legacy interface that AI agents tolerate. It is the precisely right abstraction level --- powerful enough to do anything, structured enough to reason about, and universal enough to work everywhere.

---

*Next in the series: [Bash Everywhere: Cross-Platform and Cloud Shell Environments](post-03.md) --- How Bash runs across Linux, macOS, Windows, Docker, and cloud providers.*
