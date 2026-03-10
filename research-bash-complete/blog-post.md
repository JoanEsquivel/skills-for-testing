# The Complete Bash Guide: Foundations, Best Practices, Command Combinations, and Why AI Agents Love the Shell

*Everything developers need to know about Bash in 2026 --- from how it works under the hood, to defensive scripting, to real-world pipelines, to why it became the universal language of AI coding agents.*

---

## Introduction

A developer wrote a cleanup script with a typo in a variable name. The variable was unset, the command expanded to `rm -rf /`, and the root filesystem was partially wiped. The script had no error handling. It did not check whether the variable was defined. It kept running after the critical `cd` command failed.

This story is not unusual. It happens because Bash, by default, silently continues after errors, treats undefined variables as empty strings, and reports only the exit code of the last command in a pipeline. These defaults made sense for interactive use in 1989. They are dangerous in scripts that run unattended.

But Bash is not going away. It is the default shell on nearly every Linux distribution. It is the execution layer for CI/CD pipelines, Docker containers, and AI coding assistants. The Stack Overflow `[bash]` tag has over 300,000 questions. Every developer encounters Bash, whether they choose to or not.

In early 2026, Vercel's engineering team ran an experiment: they stripped their AI coding agent down to a single capability --- Bash --- and the simpler version was 3.5x faster, achieved 100% success rate (up from 80%), and used 40% fewer tokens.

This guide is both a learning resource and a reference manual. It covers ten dimensions of Bash mastery: from history and internals, through syntax and best practices, to practical command combinations and AI agent architecture.

---

## Part 1: Foundations --- What Is Bash and How Does It Work?

### A Brief History

Bash (Bourne Again SHell) was created by Brian Fox in 1989 as a free software replacement for the Bourne shell (`sh`), part of the GNU Project. Since 1990, it has been maintained by Chet Ramey --- over 35 years of continuous stewardship by a single developer.

Key milestones:
- **1989:** First release (Bash 1.0)
- **1996:** Bash 2.0 --- arrays, programmable completion
- **2004:** Bash 3.0 --- regex matching with `=~`
- **2009:** Bash 4.0 --- associative arrays, `&>` redirection, coprocesses (license changed to GPLv3)
- **2019:** Apple switches macOS default to zsh (due to GPLv3)
- **2025:** Bash 5.3 --- current-shell command substitution, GLOBSORT, Readline 8.3

The current version is **Bash 5.3**, released July 4, 2025.

### The Three Layers: Terminal, Shell, Kernel

Every terminal interaction involves three components:

1. **Terminal Emulator** --- The application you see (iTerm2, Windows Terminal, GNOME Terminal, or a browser tab for cloud shells). It draws characters and captures keyboard input.
2. **Shell** --- The program that interprets commands (bash, zsh, fish). Just a user-space process --- nothing magical about it.
3. **Kernel (TTY Subsystem)** --- Manages the pseudo-terminal (PTY) abstraction that bridges the terminal emulator and the shell.

When you type a character, the terminal emulator writes it to the PTY master. The kernel's TTY driver delivers it to the shell process reading from the PTY slave. When the shell produces output, the reverse happens.

AI agents skip the terminal emulator entirely. Claude Code connects directly to a shell process via pipes --- no PTY, no screen rendering. The model writes commands to stdin and reads from stdout/stderr.

### How Bash Processes a Command

Bash transforms input through four stages:

**1. Input Processing** --- Readline for interactive shells (line editing, history, tab completion). File/pipe input for scripts.

**2. Parsing** --- A Yacc/Bison parser breaks input into tokens and constructs a command structure. The lexical analyzer and parser share state to resolve ambiguities.

**3. Word Expansion** --- Seven sequential expansion stages, in this exact order:

| Order | Expansion | Example |
|-------|-----------|---------|
| 1 | Brace expansion | `{a,b,c}` → `a b c` |
| 2 | Tilde expansion | `~` → `/home/user` |
| 3 | Parameter/variable expansion | `$HOME`, `${var:-default}` |
| 4 | Command substitution | `$(cmd)` or `` `cmd` `` |
| 5 | Arithmetic expansion | `$((1 + 2))` |
| 6 | Word splitting | Using IFS delimiter |
| 7 | Globbing/filename expansion | `*.py` matches Python files |

The order matters. Variables are expanded before word splitting, which is why unquoted `$var` with spaces produces multiple words.

**4. Command Execution** --- Builtins (`cd`, `export`, `source`) run inside the shell process. External commands (`ls`, `grep`, `python`) use the fork/exec mechanism.

### Fork, Exec, and Why It Matters

Every external command follows the fork-exec pattern:

1. **Fork:** Shell creates a child process --- an exact clone with the same memory, file descriptors, and environment variables
2. **Exec:** The child replaces its memory image with the new program
3. **Wait:** The parent blocks (foreground) or continues (background with `&`)

This explains critical behaviors:

- **Why `cd` is a builtin:** If `cd` ran in a child process, only the child's directory would change. The parent shell would be unaffected.
- **Why AI agent sessions must be persistent:** If each command spawned a new shell, `cd /project && npm test` would fail --- the directory change would die with the first process.
- **Why environment changes in subshells vanish:** A subshell is a fork. The child gets a copy of memory. Changes to the copy are invisible to the parent.

### File Descriptor Inheritance

When a process forks, the child inherits copies of all open file descriptors:

```bash
ls -la > output.txt
```

What happens:
1. Shell forks a child
2. Child closes fd 1 (stdout) and opens `output.txt` on fd 1
3. Child execs `ls`, which writes to fd 1 --- now a file, not the terminal
4. `ls` has no idea its output is going to a file

### Environment Variable Inheritance

Environment variables follow strict parent-to-child inheritance:
- `export`-ed variables are copied to children
- Regular shell variables stay in the parent
- A child can **never** modify its parent's environment

This is why `source script.sh` (runs in current shell) works differently from `./script.sh` (runs in a child process):

```bash
# ./script.sh sets MY_VAR inside
./script.sh
echo $MY_VAR    # Empty --- the script ran in a child process

# source runs in current shell (no fork)
source script.sh
echo $MY_VAR    # Has the value set by the script
```

### Subshells vs. Child Processes

These are different:

- **Subshell** (parentheses `()` or pipes): Fork without exec. Inherits all shell variables, even non-exported ones. Changes don't propagate back.
- **Child process** (running a script): Fork plus exec. Only exported variables are visible.

```bash
VAR="hello"  # Not exported

(echo $VAR)          # "hello" --- subshell sees it (fork, copy of memory)
bash -c 'echo $VAR'  # empty --- child process does not (fork + exec)
```

### Signal Handling

| Signal | Number | Default | Common Use |
|--------|--------|---------|------------|
| SIGINT | 2 | Terminate | Ctrl+C |
| SIGTERM | 15 | Terminate | Polite shutdown request |
| SIGKILL | 9 | Terminate (cannot be caught) | Force kill |
| SIGHUP | 1 | Terminate | Terminal closed |
| SIGTSTP | 20 | Stop | Ctrl+Z |

Key rules:
- Ignored signals (SIG_IGN) remain ignored after exec --- this is how `nohup` works
- Background processes ignore SIGINT and SIGQUIT when job control is off
- Handled signals are reset to defaults after exec

---

## Part 2: Core Concepts --- Shell Types, Syntax, and Control Flow

### Shell Types and Config Files

| Shell Type | Config Files Read |
|---|---|
| Interactive login | `/etc/profile`, then `~/.bash_profile` or `~/.bash_login` or `~/.profile` |
| Interactive non-login | `~/.bashrc` |
| Non-interactive | Only `$BASH_ENV` (if set) |

**Best practice:** Put all customizations in `~/.bashrc` and have `~/.bash_profile` source it.

AI agent sessions are typically non-interactive, meaning `~/.bashrc` is not sourced unless explicitly configured. CI/CD runners behave similarly.

### Variables

```bash
# Assignment (no spaces around =)
name="Alice"
readonly PI=3.14159

# Local variables in functions
my_function() {
  local count=0
  echo "$count"
}

# Arrays
fruits=("apple" "banana" "cherry")
echo "${fruits[0]}"          # apple
echo "${fruits[@]}"          # all elements
echo "${#fruits[@]}"         # array length

# Associative arrays (Bash 4+)
declare -A colors
colors[red]="#FF0000"
colors[blue]="#0000FF"
echo "${colors[red]}"
```

### Quoting Rules

| Quote Type | Behavior | Example |
|------------|----------|---------|
| Double `"` | Allows `$`, `` ` ``, `\` expansion | `"Hello $name"` → `Hello Alice` |
| Single `'` | Literal --- no expansion at all | `'Hello $name'` → `Hello $name` |
| `$'...'` | ANSI-C quoting (escape sequences) | `$'line1\nline2'` |
| None | Word splitting + glob expansion | Dangerous for variables |

**Rule:** Always double-quote your variables. `"$var"` is safe. `$var` is dangerous.

### Parameter Expansion

```bash
# Default values
${var:-default}      # Use default if var is unset or empty
${var:=default}      # Assign default if var is unset or empty
${var:+alternate}    # Use alternate if var IS set
${var:?error msg}    # Exit with error if var is unset

# String operations
${#var}              # String length
${var:offset:length} # Substring
${var#pattern}       # Remove shortest prefix match
${var##pattern}      # Remove longest prefix match
${var%pattern}       # Remove shortest suffix match
${var%%pattern}      # Remove longest suffix match
${var/old/new}       # Replace first match
${var//old/new}      # Replace all matches
${var,,}             # Lowercase (Bash 4+)
${var^^}             # Uppercase (Bash 4+)
```

### Brace Expansion and Globbing

```bash
# Brace expansion (generates strings, happens BEFORE variable expansion)
echo {a,b,c}         # a b c
echo file{1..5}.txt  # file1.txt file2.txt file3.txt file4.txt file5.txt
mkdir -p project/{src,tests,docs}

# Globbing (matches files)
*.py                  # All Python files
src/**/*.ts           # Recursive match (with globstar enabled)
[abc]*.txt            # Files starting with a, b, or c
```

### Arithmetic

```bash
# Use $(( )) for arithmetic. Never use expr.
result=$((5 + 3))
((count++))
((count += 10))

# Comparison in arithmetic context
if (( count > 10 )); then
  echo "Count exceeded 10"
fi
```

### Command Substitution

```bash
# Modern syntax (preferred)
today=$(date +%Y-%m-%d)

# Backtick syntax (deprecated, hard to nest)
today=`date +%Y-%m-%d`

# Bash 5.3: Current-shell substitution (no fork)
val=${ x=42; echo $x; }   # x is visible after this line
```

### Conditionals

```bash
# Use [[ ]] instead of [ ]. Always.
if [[ -f "$file" ]]; then
  echo "File exists"
elif [[ -d "$dir" ]]; then
  echo "Directory exists"
else
  echo "Neither"
fi

# String comparison
[[ "$str" == "hello" ]]    # Equality
[[ "$str" != "hello" ]]    # Inequality
[[ "$str" =~ ^[0-9]+$ ]]  # Regex match
[[ -z "$str" ]]            # Empty string
[[ -n "$str" ]]            # Non-empty string

# File tests
[[ -f "$path" ]]    # Regular file exists
[[ -d "$path" ]]    # Directory exists
[[ -r "$path" ]]    # Readable
[[ -w "$path" ]]    # Writable
[[ -x "$path" ]]    # Executable
[[ -s "$path" ]]    # Non-empty file

# Logical operators
[[ "$a" == "1" && "$b" == "2" ]]   # AND
[[ "$a" == "1" || "$b" == "2" ]]   # OR
[[ ! -f "$file" ]]                  # NOT
```

### Case Statements

```bash
case "$action" in
  start)
    echo "Starting..."
    ;;
  stop|quit)
    echo "Stopping..."
    ;;
  restart)
    echo "Restarting..."
    ;;
  *)
    echo "Unknown action: $action" >&2
    exit 1
    ;;
esac
```

### Loops

```bash
# For loop (over items)
for fruit in apple banana cherry; do
  echo "$fruit"
done

# For loop (over files --- use globbing, not ls)
for f in *.py; do
  echo "Processing $f"
done

# For loop (C-style)
for ((i = 0; i < 10; i++)); do
  echo "$i"
done

# While loop
while read -r line; do
  echo "Line: $line"
done < input.txt

# Until loop (runs while condition is false)
until [[ -f /tmp/ready ]]; do
  sleep 1
done

# Select (interactive menu)
select opt in "Option A" "Option B" "Quit"; do
  case "$opt" in
    "Quit") break ;;
    *) echo "Selected: $opt" ;;
  esac
done
```

### Functions

```bash
# Function definition
greet() {
  local name="${1:?Error: name required}"
  echo "Hello, $name!"
  return 0
}

# Call
greet "Alice"

# Capture output
result=$(greet "Bob")

# Arguments: $1, $2, ..., $@, $#
process_args() {
  echo "Argument count: $#"
  for arg in "$@"; do
    echo "  - $arg"
  done
}
```

### Trap

```bash
# Run cleanup on EXIT (regardless of how the script exits)
cleanup() {
  local exit_code=$?
  rm -f "$TEMP_FILE"
  exit "$exit_code"
}
trap cleanup EXIT

# Handle specific signals
trap 'echo "Ctrl+C caught"; exit 1' INT
trap 'echo "Terminated"; exit 1' TERM
```

---

## Part 3: Pipes and Redirection

### Standard File Descriptors

| FD | Name | Default |
|----|------|---------|
| 0 | stdin | Keyboard |
| 1 | stdout | Terminal |
| 2 | stderr | Terminal |

### Redirection Operators

```bash
# Output redirection
command > file          # Redirect stdout (overwrite)
command >> file         # Redirect stdout (append)
command 2> file         # Redirect stderr
command 2>> file        # Append stderr
command &> file         # Redirect both stdout and stderr (Bash 4+)
command > file 2>&1     # Redirect both (POSIX-compatible)
command > /dev/null     # Discard stdout
command 2> /dev/null    # Discard stderr
command &> /dev/null    # Discard both

# Input redirection
command < file          # Read from file
command << 'EOF'        # Here document (no expansion with quotes)
  literal text
EOF
command <<< "string"    # Here string
```

### Pipes

```bash
# Basic pipe: stdout of left → stdin of right
command1 | command2

# Pipe both stdout and stderr
command1 |& command2    # Bash 4+
command1 2>&1 | command2  # POSIX

# tee: split output (write to file AND continue pipe)
command | tee output.log | next_command
command | tee -a output.log   # Append mode
```

### Process Substitution

```bash
# <(command): command output available as a file
diff <(sort file1) <(sort file2)

# Avoids subshell variable problem with pipes:
count=0
while read -r line; do
  ((count++))
done < <(grep "error" log.txt)
echo "$count"   # Correct! (not a pipe subshell)

# >(command): write to a command as if it were a file
command | tee >(grep "ERROR" > errors.log) >(wc -l > count.txt)
```

---

## Part 4: Best Practices and Defensive Programming

### The Sacred First Line

Every production script should start with:

```bash
#!/usr/bin/env bash
set -o errexit   # Exit on any command failure (set -e)
set -o nounset   # Exit on undefined variable access (set -u)
set -o pipefail  # Pipe fails if any command in the chain fails
```

**errexit** stops the script when a command fails, preventing cascading damage:
```bash
cd /nonexistent/path    # Script exits here
rm -rf *                # Never executes
```

**nounset** catches typos:
```bash
rm -rf "$BULID_DIR/output"   # Error: BULID_DIR: unbound variable
```

**pipefail** exposes hidden pipeline failures:
```bash
curl https://broken-url | wc -l   # Fails (curl's error propagates)
```

For optional debug tracing:
```bash
if [[ "${TRACE-0}" == "1" ]]; then
  set -o xtrace
fi
```
Run normally or with `TRACE=1 ./script.sh` to see every command before execution.

### Google Shell Style Guide Highlights

- **When to use shell:** Keep scripts under 100 lines. Beyond that, rewrite in Python.
- **Formatting:** 2-space indentation, 80-character limit, `; then`/`; do` on same line.
- **Naming:** Functions and locals in `lowercase_with_underscores`. Constants in `UPPERCASE`.
- **Syntax:** Use `[[ ]]` not `[ ]`. Use `$(( ))` not `expr`. Use `$(cmd)` not backticks. Never use `eval`.
- **Errors:** Direct error messages to stderr: `echo "Error" >&2`.

### ShellCheck: Automated Code Review

ShellCheck (39,100+ GitHub stars) catches unquoted variables, broken test expressions, deprecated syntax, and subtle corner cases:

```bash
# Install
brew install shellcheck      # macOS
apt-get install shellcheck   # Ubuntu/Debian

# Run
shellcheck myscript.sh
```

Every warning links to a wiki page explaining the issue (e.g., SC2086 for unquoted variables).

### The Top 10 Pitfalls

From Greg Wooledge's BashPitfalls (60+ documented mistakes):

**1. Looping over `ls` output** --- breaks on filenames with spaces:
```bash
# WRONG:  for f in $(ls *.mp3); do
# RIGHT:
for f in *.mp3; do echo "$f"; done
```

**2. Unquoted variables** --- causes word splitting and glob expansion:
```bash
# WRONG:  cp $file $target
# RIGHT:
cp -- "$file" "$target"
```

**3. Filenames starting with dashes** --- interpreted as flags:
```bash
# RIGHT: use -- to end option parsing
rm -- "$filename"
```

**4. Using `[ ]` instead of `[[ ]]`** --- breaks on empty variables:
```bash
# WRONG:  [ $foo = "bar" ]
# RIGHT:
[[ "$foo" = "bar" ]]
```

**5. Pipeline variable scope** --- while loops in pipes run in subshells:
```bash
# WRONG: count modified in subshell, lost
count=0
grep "error" log.txt | while read -r line; do ((count++)); done

# RIGHT: process substitution
count=0
while read -r line; do ((count++)); done < <(grep "error" log.txt)
```

**6. Unchecked `cd`** --- subsequent commands run in wrong directory:
```bash
cd /some/dir || exit 1
```

**7. Useless use of cat:**
```bash
# WRONG:  cat file | grep pattern
# RIGHT:
grep pattern file
```

**8. In-place redirect** --- truncates file before reading:
```bash
# WRONG:  sed 's/a/b/' file > file
# RIGHT:
sed -i 's/a/b/' file
```

**9. sudo with redirects:**
```bash
# WRONG:  sudo echo "data" >> /etc/config
# RIGHT:
echo "data" | sudo tee -a /etc/config > /dev/null
```

**10. `$*` instead of `"$@"`** --- loses word boundaries:
```bash
# Always use "$@" for argument forwarding
for arg in "$@"; do echo "$arg"; done
```

### The Cleanup Pattern

```bash
cleanup() {
  local exit_code=$?
  rm -f "$TEMP_FILE"
  exit "$exit_code"
}
trap cleanup EXIT
```

### Complete Script Template

```bash
#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

if [[ "${TRACE-0}" == "1" ]]; then
  set -o xtrace
fi

cd "$(dirname "$0")"

cleanup() {
  local exit_code=$?
  # Add cleanup tasks here
  exit "$exit_code"
}
trap cleanup EXIT

err() {
  echo "[ERROR] $(date +'%Y-%m-%dT%H:%M:%S%z') $*" >&2
}

usage() {
  cat <<HELP
Usage: $(basename "$0") [OPTIONS]

Description of what this script does.

Options:
  -h, --help    Show this help message
  -v, --verbose Enable verbose output
HELP
}

main() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h|--help)   usage; exit 0 ;;
      -v|--verbose) set -o xtrace; shift ;;
      *)           err "Unknown option: $1"; usage; exit 1 ;;
    esac
  done

  # Main logic here
  echo "Script started successfully"
}

main "$@"
```

### Security

```bash
# Never use eval with external input
# Use case statements instead:
case "$user_input" in
  start|stop|restart) systemctl "$user_input" myservice ;;
  *) echo "Invalid action" >&2; exit 1 ;;
esac

# Validate input with pattern matching
if [[ ! "$port" =~ ^[0-9]+$ ]]; then
  echo "Port must be a number" >&2
  exit 1
fi

# Use absolute paths for security-sensitive scripts
/bin/rm -rf /tmp/build
```

---

## Part 5: Practical Command Combinations

### The Text Processing Trinity: grep, sed, awk

**grep** searches for patterns:
```bash
grep -rn "TODO" src/                              # Recursive with line numbers
grep -Eo '[0-9]{1,3}(\.[0-9]{1,3}){3}' access.log  # Extract IP addresses
grep -E "ERROR|FATAL" app.log                     # Multiple patterns
grep -v "DEBUG" app.log                           # Invert match
grep -C 3 "Exception" app.log                    # 3 lines context
grep -rl "TODO" src/                              # Files only
grep -rc "import" src/ | sort -t: -k2 -rn        # Count per file
```

**sed** transforms text:
```bash
sed 's/warning/WARNING/g' logfile.txt    # Global replacement
sed '/^$/d' file.txt                     # Delete blank lines
sed '/^#/d' config.txt                   # Remove comments
sed -n '/START/,/END/p' file.txt         # Extract between markers
sed 's/^/PREFIX: /' file.txt             # Insert at line start
sed -i.bak 's/old/new/g' file.txt       # In-place with backup
```

**awk** processes structured data:
```bash
awk '{print $1, $4}' access.log          # Extract columns
awk -F',' '{print $2, $3}' data.csv      # CSV columns
awk '{sum += $5} END {print sum}' data    # Sum a column
awk '$3 > 100 {print $1, $3}' data       # Filter by condition
awk '{sum += $1; n++} END {print sum/n}' numbers.txt  # Average
awk '{count[$1]++} END {for (k in count) print count[k], k}' data | sort -rn
```

**Combined:**
```bash
# Top error sources by frequency
grep "ERROR" app.log | awk '{print $4}' | sort | uniq -c | sort -rn | head -20

# Top HTTP status codes
awk '{print $9}' access.log | sort | uniq -c | sort -rn | head -10

# Top user-agents
awk -F'"' '{print $6}' access.log | sort | uniq -c | sort -rn | head -10
```

### find and xargs

Always use `-print0` with `find` and `-0` with `xargs` to handle filenames with spaces.

```bash
# Count lines in all Python files
find . -name "*.py" -type f -print0 | xargs -0 wc -l | tail -1

# Search pattern across JavaScript files
find . -name "*.js" -type f -print0 | xargs -0 grep -l "useState"

# Run ShellCheck on all shell scripts
find . -name "*.sh" -type f -print0 | xargs -0 shellcheck

# Change permissions
find . -name "*.sh" -type f -print0 | xargs -0 chmod +x

# Compress old log files
find /var/log -name "*.log" -mtime +7 -print0 | xargs -0 gzip

# Parallel processing (4 workers)
find . -name "*.png" -print0 | xargs -0 -P4 -I{} convert {} -resize 50% {}

# Copy matching files
find . -name "*.conf" -print0 | xargs -0 -I{} cp {} /backup/configs/

# Find and delete safely
find . -name "*.pyc" -type f -delete
find . -type f -empty -delete
```

### curl and jq for APIs

```bash
# GET with JSON extraction
curl -s https://api.github.com/rate_limit | jq '.rate'

# Extract fields from array
curl -s "https://api.github.com/repos/owner/repo/pulls?state=open" | \
  jq '.[] | {title: .title, author: .user.login}'

# Filter array elements
curl -s https://api.example.com/users | jq '[.[] | select(.active == true)]'

# POST with JSON body
curl -s -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# Download with progress
curl -O https://example.com/file.tar.gz

# Follow redirects, show headers
curl -sSL -D - https://example.com -o /dev/null

# Batch API calls
cat user_ids.txt | xargs -I{} curl -s "https://api.example.com/users/{}" | jq -r '.email'
```

### Log Analysis

```bash
# Real-time monitoring with filtering
tail -f /var/log/app.log | grep --line-buffered "ERROR"

# Monitor multiple log files
tail -f /var/log/{syslog,auth.log,app.log} | grep --line-buffered -E "ERROR|FATAL|CRITICAL"

# Top 10 IPs by request count
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# Error frequency by hour
grep "ERROR" app.log | awk '{print $2}' | cut -d: -f1 | sort | uniq -c

# Entries from today
grep "$(date +'%Y-%m-%d')" /var/log/app.log

# Failed SSH login attempts
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn | head -10

# HTTP response code summary
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# Request rate per minute
awk '{print $4}' access.log | cut -d: -f1-3 | sort | uniq -c | sort -rn | head -10
```

### Process Management

```bash
# Find processes by name (avoiding grep matching itself)
ps aux | grep "[n]ginx"
pgrep -a nginx                   # Cleaner alternative

# Top memory/CPU consumers
ps aux --sort=-%mem | head -11
ps aux --sort=-%cpu | head -11

# Graceful kill, then forced if needed
kill "$PID"
kill -0 "$PID" 2>/dev/null && kill -9 "$PID"

# Kill by name
pkill nginx
pkill -f "python.*worker"

# Reload configuration (SIGHUP)
kill -HUP $(pgrep nginx)

# Background jobs
long_task &              # Run in background
jobs                     # List background jobs
fg %1                    # Bring to foreground
nohup long_task > output.log 2>&1 &   # Survives terminal close
```

### Disk Usage

```bash
# Filesystem usage
df -h

# Directory sizes, sorted
du -sh */ | sort -rh

# 10 largest files
find / -type f -exec du -h {} + 2>/dev/null | sort -rh | head -10

# 10 largest directories
du -h --max-depth=1 / 2>/dev/null | sort -rh | head -10

# Files larger than 1GB
find / -type f -size +1G -exec ls -lh {} \; 2>/dev/null

# Summarize by file extension
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20

# Interactive TUI
ncdu /var/log
```

### Git from the Command Line

```bash
# Visual branch history
git log --oneline --graph --decorate --all

# Find commits that changed a specific string
git log -S "function_name" --oneline

# Show what changed in last commit
git diff HEAD~1

# Files changed between branches
git diff main..feature --stat

# Clean up merged branches
git branch --merged main | grep -v "main" | xargs git branch -d

# Who modified each line
git blame -L 10,20 file.py

# Search across all branches
git grep "search_term" $(git branch -r)

# Changelog between tags
git log v1.0..v2.0 --oneline --no-merges

# Find the commit that introduced a bug
git bisect start
git bisect bad HEAD
git bisect good v1.0
```

### Networking and SSH

```bash
# Test connectivity
ping -c 5 example.com
traceroute example.com

# Check if port is open
nc -zv example.com 443

# Active connections
ss -tuln

# DNS lookup
dig +short example.com

# SSH port forwarding (access remote service locally)
ssh -L 8080:localhost:3000 user@remote-server

# SSH tunnel for database
ssh -L 5432:db-server:5432 user@bastion-host

# Copy files over SSH
rsync -avz --progress local_dir/ user@remote:/path/to/destination/

# Execute remote command
ssh user@remote 'df -h && free -m'
```

### Real-World Multi-Tool Pipelines

```bash
# Find all TODO comments grouped by git author
git grep -n "TODO" | while IFS=: read -r file line content; do
  author=$(git blame -L "$line,$line" "$file" | awk '{print $2}')
  echo "$author: $file:$line $content"
done | sort

# Find duplicate files by checksum
find . -type f -print0 | xargs -0 md5sum | sort | uniq -d -w32

# Compare local and remote file hashes
diff <(find ./src -type f -exec md5sum {} \; | sort) \
     <(ssh user@server 'find /app/src -type f -exec md5sum {} \;' | sort)

# API endpoint usage summary
grep "HTTP" access.log | \
  awk '{print $6, $7}' | \
  sort | uniq -c | sort -rn | head -20
```

---

## Part 6: Bash in the AI and Automation Era

### Why AI Agents Choose Bash

When Anthropic built Claude Code, they gave the AI a bash shell --- not a custom runtime, not a proprietary language. This was deliberate, and every major AI coding agent has converged on the same pattern.

**Universality.** Bash exists on virtually every server, container, CI runner, and developer machine. An agent that speaks Bash operates anywhere code runs.

**Composability.** The Unix philosophy --- small tools, text pipes --- aligns with how LLMs reason. A model doesn't need a custom "search files" tool when it can compose `find . -name "*.py" | xargs grep "pattern"`.

**Text as universal protocol.** LLMs process text. Bash commands accept text and produce text. No impedance mismatch.

**Training data fluency.** LLMs have seen millions of bash commands during training --- `grep`, `sed`, `awk`, `find` appear across countless repositories and documentation. The model already knows Bash deeply.

**Stability.** `grep -r "pattern" directory/` has meant the same thing for 30 years. Python APIs change between versions. Bash commands don't.

### How Major Agents Use It

**Claude Code** maintains a persistent bash session that preserves environment variables, working directory, and shell history. Security uses two-boundary sandboxing (Linux bubblewrap, macOS seatbelt) for filesystem and network isolation --- reducing permission prompts by 84%. The bash tool adds just 245 input tokens per API call.

**GitHub Copilot CLI** translates natural language directly into shell commands. "Find all slow database queries in the last deploy and show me the logs" becomes a shell pipeline.

**Mule AI** illustrates the transformation: before bash access, the agent could discuss code. After, it could navigate projects, run tests, build binaries, manage containers. The shift was from "discussing code to doing things."

The learn-claude-code project demonstrates the minimal architecture: one message array, one LLM call, one tool dispatch, one conditional loop. Bash is the tool that makes it sufficient.

### Multi-Agent Workflows

```bash
# Git worktrees for parallel agent isolation
git worktree add ../agent-1-workspace feature-auth
git worktree add ../agent-2-workspace feature-payments

# Launch agents in parallel
claude -p "Implement OAuth login" --cwd ../agent-1-workspace &
claude -p "Add Stripe integration" --cwd ../agent-2-workspace &
wait

# Cleanup
git worktree remove ../agent-1-workspace
git worktree remove ../agent-2-workspace
```

### Bash in CI/CD

Every CI/CD platform --- GitHub Actions, GitLab CI, Jenkins --- executes steps as bash commands:

```yaml
- name: Run tests
  run: |
    set -euo pipefail
    npm ci
    npm test -- --coverage
```

Common CI patterns:

```bash
# Conditional deployment
if [[ "$GITHUB_REF" == "refs/heads/main" ]]; then
  deploy_to_production
fi

# Retry logic
retry() {
  local max=$1; shift
  local attempt=1
  until "$@"; do
    (( attempt >= max )) && { echo "Failed after $max attempts" >&2; return 1; }
    ((attempt++))
    sleep $((attempt * 2))
  done
}
retry 3 npm publish

# Cache by content hash
HASH=$(find src/ -type f -name "*.ts" -print0 | sort -z | xargs -0 md5sum | md5sum | cut -d' ' -f1)
[[ -f ".cache/$HASH" ]] && echo "Cached" || { npm run build; touch ".cache/$HASH"; }
```

### Bash in Docker

```dockerfile
# Exec form for proper signal handling (PID 1)
ENTRYPOINT ["./start.sh"]

# Shell form for RUN (uses /bin/sh -c)
RUN apt-get update && apt-get install -y curl jq && rm -rf /var/lib/apt/lists/*
```

Container entrypoint pattern:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Wait for dependencies
wait_for_service() {
  local host=$1 port=$2 timeout=${3:-30}
  for ((i=0; i<timeout; i++)); do
    nc -z "$host" "$port" 2>/dev/null && return 0
    sleep 1
  done
  echo "Timeout: $host:$port" >&2; return 1
}

trap 'kill -TERM "$child_pid"; wait "$child_pid"' SIGTERM SIGINT

wait_for_service "${DB_HOST}" "${DB_PORT:-5432}"
exec python manage.py runserver 0.0.0.0:8000 &
child_pid=$!
wait "$child_pid"
```

**Alpine Linux note:** Alpine uses BusyBox ash, not bash. Scripts with `#!/bin/bash` fail. Either install bash (`apk add --no-cache bash`) or write POSIX-compatible scripts with `#!/bin/sh`.

---

## Part 7: Where Bash Runs --- Cross-Platform Guide

### Linux (Native Home)

Most distributions ship Bash as the default. `/bin/sh` may be dash (Debian/Ubuntu) rather than bash --- `#!/bin/sh` gives POSIX-only behavior.

### macOS (The Complicated Relationship)

Since Catalina (2019), macOS defaults to zsh. Reason: GPLv3 licensing (Bash 4.0+). macOS still ships bash 3.2 from 2007 --- missing associative arrays and modern features.

```bash
# Install modern bash via Homebrew
brew install bash
# Then add to /etc/shells and chsh -s /opt/homebrew/bin/bash
```

### Windows

- **WSL2** (recommended): Real Linux kernel in a lightweight VM. Full bash compatibility.
- **Git Bash**: MinGW-based, good for git operations. Limited system compatibility.
- **PowerShell**: Native Windows. Passes objects, not text. Different paradigm entirely.

### Cloud Shell Environments

| Provider | Base | Storage | Pre-installed |
|---|---|---|---|
| AWS CloudShell | Amazon Linux 2023 | 1 GB/Region | AWS CLI, Python, Node.js |
| Google Cloud Shell | Debian-based | 5 GB | gcloud, kubectl, terraform, docker |
| Azure Cloud Shell | CBL-Mariner | 5 GB | Azure CLI, terraform, ansible, kubectl |

### Detecting Your Environment

```bash
# Detect shell
if [ -n "${BASH_VERSION:-}" ]; then
  echo "Bash $BASH_VERSION"
elif [ -n "${ZSH_VERSION:-}" ]; then
  echo "Zsh $ZSH_VERSION"
fi

# Detect OS
case "$(uname -s)" in
  Linux*)   OS="linux" ;;
  Darwin*)  OS="macos" ;;
  MINGW*)   OS="windows-gitbash" ;;
esac

# Detect container
[ -f /.dockerenv ] && echo "Running inside Docker"
```

---

## Part 8: Modern Tooling Ecosystem

### ShellCheck (Static Analysis)

39,100+ stars. Detects syntax errors, semantic problems, and edge cases. Outputs in GCC, JSON, CheckStyle XML, and terminal formats. Integrates with VS Code, Vim, Emacs, CI/CD.

### shfmt (Formatting)

Opinionated formatter for shell scripts, like prettier for bash:
```bash
shfmt -d -i 2 -ci scripts/    # Check formatting
shfmt -w -i 2 -ci scripts/    # Fix formatting
```

### bats-core (Testing)

```bash
#!/usr/bin/env bats

@test "directory is created" {
  run mkdir -p /tmp/test-dir
  [ "$status" -eq 0 ]
  [ -d /tmp/test-dir ]
}

setup() { export TEMP_DIR="$(mktemp -d)"; }
teardown() { rm -rf "$TEMP_DIR"; }
```

### Bash 5.3 Highlights (July 2025)

**Current-shell command substitution:** `${ command; }` runs in the current shell (no fork). Variables set inside are visible outside. Eliminates the subshell variable trap.

**GLOBSORT:** Controls pathname expansion sorting --- by name, size, mtime, or unsorted.

**Adoption note:** Enterprise distributions lag 6-18 months. macOS will never ship 5.3 (GPLv3). Don't target 5.3 features unless you control the environment.

### CI Quality Pipeline

```yaml
# .github/workflows/shell-lint.yml
name: Shell Script Quality
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check formatting
        run: shfmt -d -i 2 -ci .
      - name: Static analysis
        run: shellcheck -S warning scripts/*.sh
      - name: Run tests
        run: bats tests/
```

---

## Part 9: Shell Comparison --- Bash vs Zsh vs Fish

| Feature | Bash | Zsh | Fish |
|---------|------|-----|------|
| Default on Linux | Yes | No | No |
| Default on macOS | No (since Catalina) | Yes | No |
| POSIX compliance | Yes | Mostly | No |
| Auto-suggestions | Plugin needed | Plugin needed | Built-in |
| Syntax highlighting | Plugin needed | Plugin needed | Built-in |
| Tab completion | Basic | Advanced | Context-aware |
| Plugin ecosystem | Manual | Oh My Zsh (150k+ stars) | Fisher |
| Scripting compatibility | Universal | Mostly bash-compatible | Incompatible |
| Learning curve | Steep | Moderate | Gentle |

**The practical answer:** Use zsh or fish as your interactive shell for daily productivity. Write scripts in bash for portability. This is not a compromise --- it's using each tool where it's strongest.

---

## Part 10: Quick Reference Cheat Sheet

### Special Variables

| Variable | Meaning |
|----------|---------|
| `$?` | Exit status of last command |
| `$!` | PID of last background process |
| `$$` | PID of current shell |
| `$0` | Name of the script |
| `$#` | Number of arguments |
| `$@` | All arguments (preserves word boundaries) |
| `$*` | All arguments (as single string) |
| `$_` | Last argument of previous command |
| `$-` | Current shell option flags |
| `$RANDOM` | Random number 0-32767 |
| `$LINENO` | Current line number in script |
| `$SECONDS` | Seconds since shell started |
| `$BASH_VERSION` | Bash version string |
| `$PIPESTATUS[@]` | Array of exit codes from last pipeline |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Misuse of shell builtin |
| 126 | Command found but not executable |
| 127 | Command not found |
| 128+N | Killed by signal N (e.g., 130 = SIGINT) |

### Essential Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+C | Kill current command (SIGINT) |
| Ctrl+Z | Suspend current command (SIGTSTP) |
| Ctrl+D | Exit shell / EOF |
| Ctrl+L | Clear screen |
| Ctrl+R | Reverse search history |
| Ctrl+A | Move to start of line |
| Ctrl+E | Move to end of line |
| Ctrl+W | Delete word backward |
| Ctrl+U | Delete from cursor to start of line |
| Ctrl+K | Delete from cursor to end of line |
| Alt+. | Insert last argument of previous command |
| !! | Repeat last command |
| !$ | Last argument of previous command |
| !^ | First argument of previous command |

### Common One-Liners

```bash
# Serve current directory over HTTP
python3 -m http.server 8000

# Generate a random password
openssl rand -base64 32

# Watch a command repeatedly
watch -n 2 'df -h'

# Quick file backup
cp file.txt{,.bak}

# Count files in current directory
ls -1 | wc -l

# Remove duplicate lines (preserving order)
awk '!seen[$0]++' file.txt

# Convert tabs to spaces
expand -t 4 file.txt > file_spaces.txt

# Show only unique lines between two files
comm -23 <(sort file1.txt) <(sort file2.txt)

# Base64 encode/decode
echo -n "hello" | base64
echo "aGVsbG8=" | base64 -d

# Check if command exists
command -v docker &>/dev/null && echo "Docker installed"

# Parallel execution with xargs
cat urls.txt | xargs -P4 -I{} curl -sO {}

# JSON pretty-print
echo '{"a":1}' | python3 -m json.tool

# Quick timestamp
date +%Y-%m-%dT%H:%M:%S%z
```

---

## Recommended Learning Path

**Week 1-2: Foundations**
1. Read "Learn Bash in Y Minutes" for a syntax overview
2. Work through the first 10 levels of OverTheWire: Bandit
3. Install ShellCheck and configure it in your editor

**Week 3-4: Core Skills**
1. Read relevant chapters of "The Linux Command Line" (free book)
2. Write 3-5 small utility scripts for tasks you do manually
3. Run ShellCheck on each script and fix every warning

**Month 2: Intermediate**
1. Read Greg's BashGuide, especially quoting and parameter expansion
2. Study the top 20 BashPitfalls
3. Adopt Google's Shell Style Guide conventions
4. Practice building multi-command pipelines

**Month 3: Advanced**
1. Study the Bash One-Liners Explained series
2. Read Advanced Bash-Scripting Guide selectively (arrays, process substitution, signals)
3. Write a CI/CD pipeline script and a Docker entrypoint script

---

## Conclusion

Bash occupies a unique position in the development ecosystem. It is simultaneously the oldest tool most developers use daily and the execution layer for the newest AI-powered development workflows. The reasons are practical: Bash is universal, stable, composable, and transparent.

The core practices fit on one hand:
1. Start every script with `set -euo pipefail`
2. Quote every variable
3. Use `[[ ]]` for conditions, `$(( ))` for arithmetic
4. Run ShellCheck on every script
5. Use `trap` for cleanup

The composability model fits in one sentence: grep filters, awk structures, sed transforms, sort orders, uniq deduplicates, xargs parallelizes.

The strategic insight: AI agents, CI/CD runners, and Docker containers all execute Bash. Understanding it deeply means understanding how modern development automation actually works.

The terminal is not going away. The developers who master it have an advantage that compounds over time.

---

## Sources

### Official Documentation
- [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html)
- [The Architecture of Open Source Applications: Bash](https://aosabook.org/en/v1/bash.html) --- Chet Ramey
- [Bash Tool --- Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/bash-tool)
- [Claude Code Sandboxing --- Anthropic Engineering](https://www.anthropic.com/engineering/claude-code-sandboxing)

### Best Practices and Style Guides
- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)
- [Shell Script Best Practices --- Sharat](https://sharats.me/posts/shell-script-best-practices/)
- [Writing Safe Shell Scripts --- MIT SIPB](https://sipb.mit.edu/doc/safe-shell/)
- [BashPitfalls --- Greg's Wiki](https://mywiki.wooledge.org/BashPitfalls)
- [Microsoft Engineering Playbook: Bash Code Reviews](https://microsoft.github.io/code-with-engineering-playbook/code-reviews/recipes/bash/)

### Tutorials and References
- [BashGuide --- Greg's Wiki](https://mywiki.wooledge.org/BashGuide)
- [The Linux Command Line --- William Shotts](https://linuxcommand.org/tlcl.php) (free book)
- [Advanced Bash-Scripting Guide --- TLDP](https://tldp.org/LDP/abs/html/)
- [Learn Bash in Y Minutes](https://learnxinyminutes.com/bash/)
- [Bash One-Liners Explained --- catonmat](https://catonmat.net/bash-one-liners-explained-part-one)
- [Bash-Oneliner Collection](https://onceupon.github.io/Bash-Oneliner/)

### AI Agents and Bash
- [The Key to Agentic Success? BASH Is All You Need --- The New Stack](https://thenewstack.io/the-key-to-agentic-success-let-unix-bash-lead-the-way/)
- [learn-claude-code --- shareAI-lab](https://github.com/shareAI-lab/learn-claude-code)
- [Mule AI Gets a Shell](https://muleai.io/blog/mule-ai-bash-tool-pr95/)
- [Claude Code and Bash Scripts --- Steve Kinney](https://stevekinney.com/courses/ai-development/claude-code-and-bash-scripts)

### Tools
- [ShellCheck](https://www.shellcheck.net/) --- [GitHub](https://github.com/koalaman/shellcheck)
- [shfmt](https://github.com/mvdan/shfmt)
- [bats-core](https://github.com/bats-core/bats-core)
- [awesome-bash](https://github.com/awesome-lists/awesome-bash)

### Community
- [r/bash](https://www.reddit.com/r/bash/)
- [r/commandline](https://www.reddit.com/r/commandline/)
- [Top 100 Bash Questions on Stack Overflow](https://toss.readthedocs.io/en/latest/so100.html)
- [OverTheWire: Bandit](https://overthewire.org/wargames/bandit/)
