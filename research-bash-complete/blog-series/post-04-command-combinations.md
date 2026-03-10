# Post 2: Practical Bash Command Combinations Every Developer Should Know

*Stop Googling the same commands. Build a toolkit you actually remember.*

---

## The Power of Pipes

The Unix philosophy says: "Write programs that do one thing and do it well. Write programs to work together." Bash's pipe operator (`|`) is what makes this philosophy practical. A single grep finds patterns. A single awk extracts fields. A single sort orders lines. Combined through pipes, they become a data processing engine that rivals dedicated tools.

This post is a curated collection of the most useful bash command combinations, organized by the tasks developers actually perform. Each example is production-tested and handles edge cases like filenames with spaces, large files, and special characters.

---

## Text Processing: The grep, sed, awk Trinity

These three tools handle the vast majority of text processing tasks. Understanding when to use each one is the key to writing clean pipelines.

- **grep** searches for patterns and filters lines
- **sed** transforms text with find-and-replace operations
- **awk** processes structured data by fields and columns

### grep Essentials

```bash
# Case-insensitive search with line numbers
grep -in "error" application.log

# Show 3 lines of context around each match
grep -C 3 "Exception" application.log

# Search recursively, showing only filenames
grep -rl "TODO" src/

# Count matches per file
grep -rc "import" src/ | sort -t: -k2 -rn | head -10

# Extract IP addresses from a log
grep -Eo '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' access.log

# Invert match: show lines WITHOUT a pattern
grep -v "DEBUG" application.log

# Multiple patterns (OR logic)
grep -E "ERROR|FATAL|CRITICAL" application.log
```

### sed Essentials

```bash
# Replace first occurrence on each line
sed 's/warning/WARNING/' logfile.txt

# Replace ALL occurrences on each line (global flag)
sed 's/warning/WARNING/g' logfile.txt

# Delete blank lines
sed '/^$/d' file.txt

# Delete lines matching a pattern
sed '/^#/d' config.txt    # Remove comments

# Insert text at the beginning of each line
sed 's/^/PREFIX: /' file.txt

# Extract lines between two patterns (inclusive)
sed -n '/START/,/END/p' file.txt

# In-place editing (with backup on macOS)
sed -i.bak 's/old/new/g' file.txt
```

### awk Essentials

```bash
# Print specific columns (space-delimited)
awk '{print $1, $4}' access.log

# Print with custom separator
awk -F',' '{print $2, $3}' data.csv

# Sum a numeric column
awk '{sum += $5} END {print sum}' data.txt

# Filter rows by condition
awk '$3 > 100 {print $1, $3}' data.txt

# Count unique values in a column
awk '{count[$1]++} END {for (k in count) print count[k], k}' data.txt | sort -rn

# Calculate average
awk '{sum += $1; n++} END {print sum/n}' numbers.txt
```

### Combining All Three

```bash
# Extract unique error sources from a log, sorted by frequency
grep "ERROR" app.log | awk '{print $4}' | sort | uniq -c | sort -rn | head -20

# Replace "warning" with "WARNING" and extract error fields
sed 's/warning/WARNING/g' logfile.txt | awk '$3 == "ERROR" {print $1, $4}'

# Find the 10 most common HTTP status codes
awk '{print $9}' access.log | sort | uniq -c | sort -rn | head -10

# Extract and count unique user-agents
awk -F'"' '{print $6}' access.log | sort | uniq -c | sort -rn | head -10
```

---

## File Discovery: find and xargs

The `find` command locates files by name, type, size, date, and permissions. Combined with `xargs`, it executes commands on the results efficiently.

### find Patterns

```bash
# Find files by name pattern
find . -name "*.py" -type f

# Find files modified in the last 24 hours
find . -type f -mtime -1

# Find files larger than 100MB
find / -type f -size +100M 2>/dev/null

# Find empty files and directories
find . -type f -empty
find . -type d -empty

# Find and delete .pyc files
find . -name "*.pyc" -type f -delete

# Find files with specific permissions
find . -type f -perm 777
```

### find + xargs: The Power Combination

Always use `-print0` with `find` and `-0` with `xargs` to handle filenames containing spaces, newlines, or other special characters.

```bash
# Count lines in all Python files
find . -name "*.py" -type f -print0 | xargs -0 wc -l | tail -1

# Search for a pattern across all JavaScript files
find . -name "*.js" -type f -print0 | xargs -0 grep -l "useState"

# Compress all log files older than 7 days
find /var/log -name "*.log" -mtime +7 -print0 | xargs -0 gzip

# Change permissions on all shell scripts
find . -name "*.sh" -type f -print0 | xargs -0 chmod +x

# Run ShellCheck on all bash scripts in a project
find . -name "*.sh" -type f -print0 | xargs -0 shellcheck

# Copy matching files to a target directory
find . -name "*.conf" -print0 | xargs -0 -I{} cp {} /backup/configs/
```

### xargs with Parallelism

```bash
# Process files in parallel (4 at a time)
find . -name "*.png" -print0 | xargs -0 -P4 -I{} convert {} -resize 50% {}

# Parallel compression
find . -name "*.log" -print0 | xargs -0 -P$(nproc) gzip
```

---

## API Interaction: curl and jq

The combination of `curl` (HTTP client) and `jq` (JSON processor) turns the terminal into a powerful API testing and data extraction tool.

### curl Basics

```bash
# Simple GET request
curl -s https://api.example.com/users

# GET with headers
curl -s -H "Authorization: Bearer $TOKEN" https://api.example.com/users

# POST with JSON body
curl -s -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# Download a file with progress
curl -O https://example.com/file.tar.gz

# Follow redirects and show response headers
curl -sSL -D - https://example.com -o /dev/null

# Send form data
curl -s -X POST https://api.example.com/upload \
  -F "file=@document.pdf" \
  -F "description=Monthly report"
```

### jq Basics

```bash
# Pretty-print JSON
curl -s https://api.example.com/data | jq '.'

# Extract a single field
curl -s https://api.example.com/user/1 | jq '.name'

# Extract a field without quotes (raw output)
curl -s https://api.example.com/user/1 | jq -r '.name'

# Get array length
curl -s https://api.example.com/users | jq 'length'

# Extract specific fields from array objects
curl -s https://api.example.com/users | jq '.[] | {name: .name, email: .email}'

# Filter array elements
curl -s https://api.example.com/users | jq '[.[] | select(.active == true)]'

# Get the first N elements
curl -s https://api.example.com/users | jq '.[0:5]'
```

### Practical API Workflows

```bash
# Check GitHub API rate limit
curl -s https://api.github.com/rate_limit | jq '.rate'

# List open pull requests for a repo
curl -s "https://api.github.com/repos/owner/repo/pulls?state=open" | \
  jq '.[] | {title: .title, author: .user.login, created: .created_at}'

# Monitor an endpoint's response time
while true; do
  time curl -so /dev/null https://example.com
  sleep 5
done

# Batch API calls using xargs
cat user_ids.txt | xargs -I{} curl -s "https://api.example.com/users/{}" | \
  jq -r '.email'
```

---

## Process Management

### Monitoring Processes

```bash
# Show all processes with full details (BSD style)
ps aux

# Show processes in a tree view
ps aux --forest    # Linux
pstree             # Alternative

# Find processes by name
ps aux | grep "[n]ginx"    # The [n] trick avoids matching grep itself
pgrep -a nginx             # Cleaner alternative

# Show the top 10 memory-consuming processes
ps aux --sort=-%mem | head -11

# Show the top 10 CPU-consuming processes
ps aux --sort=-%cpu | head -11

# Watch a specific process
watch -n 1 'ps aux | grep "[m]yprocess"'
```

### Killing Processes

```bash
# Graceful termination (SIGTERM)
kill $PID
kill -15 $PID

# Forceful termination (SIGKILL) --- use as last resort
kill -9 $PID

# Kill by name
pkill nginx
killall nginx

# Kill all processes matching a pattern
pkill -f "python.*worker"

# Send SIGHUP to reload configuration
kill -HUP $(pgrep nginx)
```

### Background Jobs

```bash
# Run a command in the background
long_running_task &

# List background jobs
jobs

# Bring job to foreground
fg %1

# Continue a stopped job in the background
bg %1

# Run a command that survives terminal close
nohup long_running_task > output.log 2>&1 &

# Disown a running job
long_running_task &
disown %1
```

---

## Disk Usage Analysis

```bash
# Show filesystem usage in human-readable format
df -h

# Show disk usage of current directory's children, sorted
du -sh */ | sort -rh

# Show total size of a directory
du -sh /var/log/

# Find the 10 largest files on the system
find / -type f -exec du -h {} + 2>/dev/null | sort -rh | head -10

# Find the 10 largest directories
du -h --max-depth=1 / 2>/dev/null | sort -rh | head -10

# Show disk usage with ncdu (interactive TUI)
ncdu /var/log

# Watch disk space in real time
watch -n 5 df -h

# Find files larger than 1GB
find / -type f -size +1G -exec ls -lh {} \; 2>/dev/null

# Summarize disk usage by file extension
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
```

---

## Log Analysis

```bash
# Follow a log file in real time
tail -f /var/log/syslog

# Follow with pattern filtering
tail -f /var/log/app.log | grep --line-buffered "ERROR"

# Show the last 100 lines
tail -n 100 /var/log/app.log

# Show log entries from today
grep "$(date +'%Y-%m-%d')" /var/log/app.log

# Count errors per hour
grep "ERROR" app.log | awk '{print $2}' | cut -d: -f1 | sort | uniq -c

# Find the top 10 IPs hitting your server
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# Find the top requested URLs
awk '{print $7}' access.log | sort | uniq -c | sort -rn | head -10

# Show failed SSH login attempts
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn | head -10

# Calculate request rate per minute
awk '{print $4}' access.log | cut -d: -f1-3 | sort | uniq -c | sort -rn | head -10

# Extract and summarize HTTP response codes
awk '{print $9}' access.log | sort | uniq -c | sort -rn
```

---

## Git Productivity from the Command Line

```bash
# Visual log with branches
git log --oneline --graph --decorate --all

# Find commits containing a specific string
git log -S "function_name" --oneline

# Show what changed in the last commit
git diff HEAD~1

# Show files changed between two branches
git diff main..feature --stat

# Clean up merged branches
git branch --merged main | grep -v "main" | xargs git branch -d

# Stash changes with a message
git stash push -m "work in progress: feature X"

# Interactive rebase of the last 5 commits
git rebase -i HEAD~5

# Find the commit that introduced a bug (bisect)
git bisect start
git bisect bad HEAD
git bisect good v1.0
# Git will checkout commits for you to test

# Show who last modified each line
git blame -L 10,20 file.py

# Search for a pattern across all branches
git grep "search_term" $(git branch -r)

# Generate a changelog between two tags
git log v1.0..v2.0 --oneline --no-merges
```

---

## Networking and SSH

```bash
# Test connectivity
ping -c 5 example.com

# Trace the network path
traceroute example.com

# Combined ping + traceroute (continuous)
mtr example.com

# Check if a port is open
nc -zv example.com 443

# Show active connections
ss -tuln

# DNS lookup
dig +short example.com
dig MX example.com

# SSH with port forwarding (access remote service locally)
ssh -L 8080:localhost:3000 user@remote-server

# SSH tunnel for database access
ssh -L 5432:db-server:5432 user@bastion-host

# Copy files over SSH
scp -r local_dir/ user@remote:/path/to/destination/
rsync -avz --progress local_dir/ user@remote:/path/to/destination/

# Execute a command on a remote server
ssh user@remote 'df -h && free -m'
```

---

## Putting It All Together: Real-World Pipelines

Here are some multi-tool pipelines that solve actual developer problems.

```bash
# Find all TODO comments in a codebase, grouped by author
git grep -n "TODO" | while IFS=: read -r file line content; do
  author=$(git blame -L "$line,$line" "$file" | awk '{print $2}')
  echo "$author: $file:$line $content"
done | sort

# Generate a summary of API endpoint usage from logs
grep "HTTP" access.log | \
  awk '{print $6, $7}' | \
  sort | uniq -c | sort -rn | \
  awk '{printf "%6d  %s %s\n", $1, $2, $3}' | head -20

# Monitor multiple log files simultaneously
tail -f /var/log/{syslog,auth.log,app.log} | \
  grep --line-buffered -E "ERROR|FATAL|CRITICAL"

# Find duplicate files by checksum
find . -type f -print0 | \
  xargs -0 md5sum | \
  sort | \
  awk '{print $1}' | \
  uniq -d | \
  while read -r hash; do
    grep "$hash" <(find . -type f -print0 | xargs -0 md5sum)
  done

# Deploy check: compare local and remote file hashes
diff <(find ./src -type f -exec md5sum {} \; | sort) \
     <(ssh user@server 'find /app/src -type f -exec md5sum {} \;' | sort)
```

---

## Conclusion

The command line is not a relic --- it is a composable toolkit. Each command does one thing. Pipes connect them into workflows that are reproducible, scriptable, and fast. The combinations in this post cover the tasks developers encounter most often: searching code, processing logs, managing processes, analyzing disk usage, interacting with APIs, and working with git.

The key insight is not memorizing every flag. It is understanding the composition model: grep filters, awk structures, sed transforms, sort orders, uniq deduplicates, and xargs parallelizes. Once you internalize these roles, you can construct new pipelines for problems you have never seen before.

---

*Next in the series: [Post 3 --- Bash in the AI and Automation Era](./post-03.md) explores how AI agents use bash, CI/CD scripting, and Docker automation patterns.*
