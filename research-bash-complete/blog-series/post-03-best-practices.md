# Post 1: Bash Best Practices and Defensive Programming

*How to write bash scripts that don't silently break at 3 AM.*

---

## The Script That Deleted Everything

A developer once wrote a cleanup script with a simple typo. Instead of `rm -rf $BUILD_DIR/output`, the variable was unset, and the command expanded to `rm -rf /output`. The root filesystem was partially wiped before anyone noticed. The script had no error handling, no variable checks, and no safeguards.

This is not an unusual story. It happens because bash, by default, does something deeply unintuitive: it keeps running after errors. A command fails? Bash shrugs and moves to the next line. A variable is undefined? Bash treats it as an empty string. A pipe silently drops data? The exit code looks fine.

Defensive bash programming exists to prevent exactly these failures.

---

## Why Bash Needs Guardrails

Unlike Python or JavaScript, bash was designed for interactive use first and scripting second. Its defaults favor convenience over safety. When you type commands one at a time, you see each result immediately. When those same commands run unattended in a script, nobody is watching.

This is why every production bash script should begin with explicit safety settings, and why the community has developed strong conventions around error handling, quoting, and code organization.

---

## The Sacred First Line: set -euo pipefail

Every bash best practices guide --- from Google's Shell Style Guide to MIT SIPB's "Writing Safe Shell Scripts" to Bert Van Vreckem's cheat sheets --- agrees on one thing: start your scripts with strict mode.

```bash
#!/usr/bin/env bash
set -o errexit   # Exit on any command failure
set -o nounset   # Exit on undefined variable access
set -o pipefail  # Pipe fails if any command in the chain fails
```

Here is what each flag does and why it matters.

### set -o errexit (set -e)

Without this flag, bash silently continues after any command failure. With it, any non-zero exit status causes the entire script to terminate immediately.

```bash
# WITHOUT errexit: the script continues past the failed cd
cd /nonexistent/path
rm -rf *   # This runs in the WRONG directory

# WITH errexit: the script exits at the failed cd
set -o errexit
cd /nonexistent/path
rm -rf *   # This never executes
```

When you intentionally expect a command to fail, append `|| true`:

```bash
grep "pattern" file.txt || true   # Allowed to fail
```

### set -o nounset (set -u)

Without this flag, referencing an undefined variable silently expands to an empty string. With it, any reference to an unset variable triggers an immediate error.

```bash
# WITHOUT nounset: $BULID_DIR is a typo, expands to ""
rm -rf "$BULID_DIR/output"   # Becomes: rm -rf "/output"

# WITH nounset: script exits with an error about BULID_DIR
set -o nounset
rm -rf "$BULID_DIR/output"   # Error: BULID_DIR: unbound variable
```

For variables that are legitimately optional, use a default value:

```bash
local timeout="${TIMEOUT:-30}"   # Default to 30 if unset
```

### set -o pipefail

Without this flag, a pipeline's exit code is determined only by the last command. With it, the pipeline returns the exit code of the first failing command.

```bash
# WITHOUT pipefail: exit code is 0 (wc succeeds)
curl https://broken-url | wc -l
echo "Success!"   # This prints even though curl failed

# WITH pipefail: exit code reflects curl's failure
set -o pipefail
curl https://broken-url | wc -l
echo "Success!"   # This never prints
```

### Bonus: Debug Tracing

Many practitioners add optional debug support:

```bash
if [[ "${TRACE-0}" == "1" ]]; then
  set -o xtrace   # Print each command before execution
fi
```

Run the script normally with `./script.sh` or with full tracing via `TRACE=1 ./script.sh`.

---

## Google's Shell Style Guide: Key Rules

Google published a comprehensive shell style guide that reflects years of experience with large-scale scripting. The most important rules include:

**When to use shell at all:**
- Shell is acceptable for small utilities and simple wrapper scripts
- If the script exceeds 100 lines, rewrite it in Python
- If performance matters, do not use shell

**Formatting:**
- Use 2-space indentation (no tabs)
- Maximum 80 characters per line
- Put `; then` and `; do` on the same line as `if`/`for`/`while`

**Variable and function naming:**
- Functions: `lowercase_with_underscores`
- Local variables: `lowercase_with_underscores`, always declared with `local`
- Constants and exported variables: `UPPERCASE_WITH_UNDERSCORES`
- Always use `${var}` notation with double quotes: `"${var}"`

**Syntax preferences:**
- Use `[[ ... ]]` instead of `[ ... ]` or `test`
- Use `$(( ... ))` for arithmetic, never `expr` or `let`
- Use `$(command)` for command substitution, never backticks
- Never use `eval`
- Never use aliases in scripts (use functions instead)

**Error handling:**
- Direct all error messages to stderr: `echo "Error" >&2`
- Always check return values

---

## ShellCheck: Your Automated Code Reviewer

ShellCheck is an open-source static analysis tool for shell scripts, comparable to ESLint for JavaScript or flake8 for Python. It catches three categories of issues:

1. **Beginner syntax errors** --- missing quotes, broken test expressions, incorrect variable assignments
2. **Semantic problems** --- unquoted variables causing word splitting, incorrect loop constructs, misused commands
3. **Subtle corner cases** --- behaviors that work in testing but fail under unusual inputs or edge conditions

### Using ShellCheck

The fastest way to try it is the online tool at shellcheck.net. For regular use, install it locally:

```bash
# macOS
brew install shellcheck

# Ubuntu/Debian
apt-get install shellcheck

# Run against a script
shellcheck myscript.sh
```

ShellCheck integrates with VS Code, Vim, Emacs, and Sublime Text through editor plugins, providing real-time feedback as you write.

### CI Integration

Add ShellCheck to your GitHub Actions workflow:

```yaml
- name: Lint shell scripts
  uses: ludeeus/action-shellcheck@master
  with:
    scandir: './scripts'
```

Every warning ShellCheck produces has an associated wiki page (e.g., SC2086 for unquoted variables) explaining the issue and the fix.

---

## The Top 10 Bash Pitfalls

Greg Wooledge's BashPitfalls page documents over 60 common mistakes. These are the ten most dangerous ones that affect developers regularly.

### 1. Looping Over ls Output

```bash
# WRONG: breaks on filenames with spaces
for f in $(ls *.mp3); do
  echo "$f"
done

# RIGHT: use globbing directly
for f in *.mp3; do
  echo "$f"
done
```

### 2. Unquoted Variables

```bash
# WRONG: word splitting and glob expansion
cp $file $target

# RIGHT: always quote
cp -- "$file" "$target"
```

### 3. Filenames Starting with Dashes

```bash
# WRONG: -rf.txt is interpreted as flags
rm $filename

# RIGHT: use -- to end option parsing
rm -- "$filename"
# Or prefix with ./
rm "./$filename"
```

### 4. Using [ ] Instead of [[ ]]

```bash
# WRONG: breaks if $foo is empty
[ $foo = "bar" ]

# RIGHT: [[ ]] handles empty variables safely
[[ "$foo" = "bar" ]]
```

### 5. Pipeline Variable Scope

```bash
# WRONG: count is modified in a subshell, change is lost
count=0
grep "error" log.txt | while read -r line; do
  ((count++))
done
echo "$count"   # Always prints 0

# RIGHT: use process substitution
count=0
while read -r line; do
  ((count++))
done < <(grep "error" log.txt)
echo "$count"   # Prints actual count
```

### 6. Unchecked cd Commands

```bash
# WRONG: if cd fails, rm runs in the wrong directory
cd /some/dir
rm -rf output/

# RIGHT: exit on failure
cd /some/dir || exit 1
rm -rf output/
```

### 7. cat file | sed (Useless Use of Cat)

```bash
# WRONG: unnecessary process
cat file.txt | sed 's/foo/bar/'

# RIGHT: sed reads files directly
sed 's/foo/bar/' file.txt
```

### 8. In-Place File Modification via Redirect

```bash
# WRONG: file gets truncated before sed reads it
sed 's/foo/bar/' file.txt > file.txt

# RIGHT: use a temporary file or sed -i
sed 's/foo/bar/' file.txt > tmp && mv tmp file.txt
# Or:
sed -i 's/foo/bar/' file.txt
```

### 9. sudo with Redirections

```bash
# WRONG: redirection happens before sudo
sudo echo "data" >> /etc/config

# RIGHT: run the shell itself as root
echo "data" | sudo tee -a /etc/config > /dev/null
```

### 10. Using $* Instead of "$@"

```bash
# WRONG: loses word boundaries between arguments
for arg in $*; do echo "$arg"; done

# RIGHT: preserves each argument as a separate word
for arg in "$@"; do echo "$arg"; done
```

---

## The Cleanup Pattern: Trap on EXIT

Production scripts often create temporary files, acquire locks, or start background processes. If the script exits early (due to errexit or an explicit failure), these resources need cleanup.

```bash
cleanup() {
  local exit_code=$?
  rm -f "$TEMP_FILE"
  echo "Cleanup complete (exit code: ${exit_code})" >&2
  exit "$exit_code"
}
trap cleanup EXIT
```

The `trap cleanup EXIT` runs the cleanup function regardless of how the script exits --- whether normally, via error, or via a signal.

---

## A Complete Script Template

Combining all these practices into a starter template:

```bash
#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

if [[ "${TRACE-0}" == "1" ]]; then
  set -o xtrace
fi

# Change to script's directory
cd "$(dirname "$0")"

# Cleanup on exit
cleanup() {
  local exit_code=$?
  # Add cleanup tasks here
  exit "$exit_code"
}
trap cleanup EXIT

# Error logging
err() {
  echo "[ERROR] $(date +'%Y-%m-%dT%H:%M:%S%z') $*" >&2
}

# Help text
usage() {
  cat <<HELP
Usage: $(basename "$0") [OPTIONS]

Description of what this script does.

Options:
  -h, --help    Show this help message
  -v, --verbose Enable verbose output
HELP
}

# Parse arguments
main() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h|--help)
        usage
        exit 0
        ;;
      -v|--verbose)
        set -o xtrace
        shift
        ;;
      *)
        err "Unknown option: $1"
        usage
        exit 1
        ;;
    esac
  done

  # Main logic here
  echo "Script started successfully"
}

main "$@"
```

---

## Security Considerations

When scripts accept external input --- from users, environment variables, or file contents --- injection vulnerabilities become a concern.

**Never use eval with external input:**

```bash
# DANGEROUS: arbitrary code execution
eval "$user_input"

# Instead, use case statements or validated patterns
case "$user_input" in
  start|stop|restart) systemctl "$user_input" myservice ;;
  *) echo "Invalid action" >&2; exit 1 ;;
esac
```

**Use absolute paths for commands:**

```bash
# A modified PATH could run malicious versions
rm -rf /tmp/build

# Safer: use absolute paths
/bin/rm -rf /tmp/build
```

**Validate input before use:**

```bash
# Check that input contains only expected characters
if [[ ! "$port" =~ ^[0-9]+$ ]]; then
  echo "Port must be a number" >&2
  exit 1
fi
```

---

## Conclusion

Defensive bash programming is not optional --- it is the difference between scripts that work in testing and scripts that survive production. The core practices are straightforward:

1. Always start with `set -euo pipefail`
2. Always quote your variables
3. Use `[[ ]]` for conditionals and `$(( ))` for arithmetic
4. Run ShellCheck on every script
5. Implement cleanup traps for resource management
6. Validate all external input

These are not theoretical suggestions. They are hard-won lessons from the collective experience of the bash community, distilled into practices that prevent real outages and data loss.

---

*Next in the series: [Post 2 --- Practical Command Combinations](./post-02.md) covers the essential grep, awk, sed, find, xargs, curl, and jq patterns that every developer should know.*
