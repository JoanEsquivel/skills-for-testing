# Bash Everywhere: Cross-Platform and Cloud Shell Environments

## The Hook

In 2025, no developer lives in a single environment. Code is written on macOS, tested in Docker containers, deployed through GitHub Actions runners, debugged via SSH on Linux servers, and managed through cloud shell consoles in a browser. The one constant across all of these environments is some variant of a Unix shell. But "some variant" hides important differences. macOS defaults to zsh. Alpine containers use ash. Windows developers use WSL, Git Bash, or PowerShell. Cloud shells come pre-configured with provider-specific tooling.

For AI agents that rely on bash as their primary interface, these platform differences are not trivia --- they are the difference between a command that works and one that fails silently.

## Context: Bash's Platform History

Bash was first released in 1989 as the GNU Project's free replacement for the Bourne shell. For decades, it was the default shell on virtually every Unix-like system, including Linux distributions and macOS.

That changed in 2019 when Apple announced that macOS Catalina would default to zsh instead of bash. The reason was not technical preference --- it was licensing. Bash 3.2 (released in 2007) was the last version under GPLv2. Starting with Bash 4.0, the license changed to GPLv3, which includes anti-Tivoization clauses that prevent vendors from using GPLv3 code on systems that block third-party software installation. The GPLv3 also includes an explicit patent license. Apple, unwilling to accept these terms, froze at Bash 3.2 and eventually switched the default to zsh, which uses an MIT-style license.

This means macOS still ships bash --- but it is version 3.2, nearly two decades old, missing features like associative arrays, `|&` pipe syntax, and `${var,,}` case conversion that scripts written for modern bash depend on.

## Deep Dive: Bash Across Platforms

### Linux (Native Home)

Linux is where Bash is most at home. Most distributions ship Bash as the default shell, and system scripts in `/etc/init.d/` and elsewhere assume Bash availability. As of 2025, most distributions ship Bash 5.1 or 5.2, with Bash 5.3 (released July 2025) rolling out through package updates.

Key considerations:
- `/bin/bash` is the standard path (some systems symlink `/usr/bin/bash`)
- System shell (`/bin/sh`) may or may not be bash --- Debian/Ubuntu use dash for `/bin/sh` for performance
- The distinction between `/bin/sh` and `/bin/bash` matters: running a script with `#!/bin/sh` gets POSIX-only behavior even if `/bin/sh` is a symlink to bash (bash enters POSIX mode)

### macOS (The Complicated Relationship)

Since Catalina (2019), macOS defaults to zsh. But bash is still available:
- `/bin/bash` exists but is version 3.2 (GPLv2, released 2007)
- Modern Bash (5.x) can be installed via Homebrew: `brew install bash`
- Homebrew bash installs to `/opt/homebrew/bin/bash` (Apple Silicon) or `/usr/local/bin/bash` (Intel)
- To use Homebrew bash as your default: add it to `/etc/shells` and run `chsh -s /opt/homebrew/bin/bash`

Zsh is largely bash-compatible for interactive use and simple scripts. Most bash syntax works in zsh, including loops, conditionals, pipes, and redirections. The differences surface in edge cases: array indexing (zsh is 1-based, bash is 0-based), globbing behavior, and some parameter expansion syntax.

For AI agents operating on macOS, Claude Code inherits whatever shell the user has configured. The Claude Code documentation notes it "inherits your bash environment," but the actual shell may be zsh. Agent implementations should test for `$BASH_VERSION` or `$ZSH_VERSION` and adapt accordingly.

### Windows (WSL Changed Everything)

Windows historically had no native Unix shell. Three approaches exist today:

**Windows Subsystem for Linux (WSL2):** The recommended approach since 2020. WSL2 runs a real Linux kernel in a lightweight VM, providing full bash compatibility. Docker Desktop integrates with WSL2, allowing containers to run natively. Developers get a complete Linux environment alongside Windows.

**Git Bash:** Bundled with Git for Windows. Provides a MinGW-based bash environment with core Unix utilities (grep, sed, awk, find). Good enough for git operations and simple scripts, but lacks full system-level compatibility --- no `apt`, no `systemctl`, no real process management.

**PowerShell:** Windows' native shell. Fundamentally different from bash --- it passes objects rather than text through pipes. Not a substitute for bash, but GitHub Actions runners on Windows default to PowerShell, and many Windows-native tools expect it.

For cross-platform consistency, the current best practice is WSL2 on Windows paired with a tool like Starship (a cross-shell prompt) to maintain a consistent experience across macOS and Windows.

### Docker Containers (The Shell Question)

Docker containers are where shell assumptions break most visibly:

**Standard images (Ubuntu, Debian, Fedora):** Ship with bash at `/bin/bash`. Scripts using bash-specific syntax work out of the box.

**Alpine Linux:** The most popular minimal base image (~3 MB vs. ~28 MB for Ubuntu). Uses BusyBox, which provides ash (Almquist shell) as `/bin/sh`. Bash is not installed by default. Scripts with `#!/bin/bash` fail with "not found." Two solutions:
- Rewrite scripts to use `#!/bin/sh` with POSIX-compatible syntax
- Add `RUN apk add --no-cache bash` to your Dockerfile (increases image size by ~4 MB)

**Distroless images:** Contain no shell at all. These are production-optimized images that include only the application binary and its runtime dependencies. You cannot exec into them for debugging.

**Entrypoint scripts:** Docker ENTRYPOINT and CMD directives determine what runs when a container starts. A common pattern is an entrypoint.sh script that configures the environment before running the main process. These scripts must match the container's available shell:

```dockerfile
# For Alpine --- use sh, not bash
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
```

```bash
#!/bin/sh
# POSIX-compatible --- works on Alpine, Ubuntu, and anywhere
set -e
echo "Starting application..."
exec "$@"
```

For AI agents working with containers, this is a practical issue. An agent that generates `#!/bin/bash` entrypoint scripts will fail on Alpine. Robust agents should detect the container base image and adjust.

## Cloud Shell Environments

All three major cloud providers offer browser-based shell environments:

### AWS CloudShell

- **Base:** Amazon Linux 2023
- **Shell:** Bash (default), also supports PowerShell and zsh
- **Persistent storage:** 1 GB per Region (free)
- **Pre-installed tools:** AWS CLI, vim, wget, make, pip, Python, Node.js, git
- **Use case:** Quick AWS resource management without local CLI setup

### Google Cloud Shell

- **Base:** Debian-based custom image
- **Shell:** Bash with extensive Google Cloud SDK pre-installed
- **Persistent storage:** 5 GB in `$HOME`
- **Pre-installed tools:** gcloud CLI, kubectl, terraform, docker, and language runtimes
- **Use case:** Google Cloud administration, tutorials, and experimentation

### Azure Cloud Shell

- **Base:** Linux container (CBL-Mariner)
- **Shell:** Bash or PowerShell (user choice)
- **Persistent storage:** 5 GB via Azure Files share
- **Pre-installed tools:** Azure CLI, Azure PowerShell, terraform, ansible, kubectl
- **Use case:** Azure resource management with authenticated access

All three cloud shells provide authenticated, browser-accessible bash environments. For AI agents, cloud shells represent a potential execution environment --- an agent could, in principle, operate through a cloud shell to manage infrastructure. The pre-installed tooling (terraform, kubectl, provider CLIs) makes them natural targets for infrastructure-focused agents.

## Bash in CI/CD Pipelines

### GitHub Actions

GitHub Actions runners default to bash on Linux and macOS:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Run tests
        run: |
          set -euo pipefail
          npm install
          npm test
```

Key patterns:
- **Shell selection:** `defaults.run.shell: bash` sets bash globally; individual steps can override with `shell: bash`
- **Strict mode:** `set -euo pipefail` is essential. Without it, failures in multi-line scripts may be silently ignored.
- **Windows runners:** Default to PowerShell. Use `shell: bash` explicitly to get Git Bash.
- **Secrets:** Accessed via `${{ secrets.MY_SECRET }}` --- injected as environment variables before the bash step runs.
- **Multi-line scripts:** The `|` YAML syntax preserves newlines. Each `run:` block executes in a fresh shell process, so `cd` and `export` do not persist between steps.

### Docker-Based CI

CI systems like Jenkins, GitLab CI, and CircleCI run jobs inside Docker containers. The available shell depends on the container image. A common failure mode: a CI pipeline works with `ubuntu:latest` but breaks when someone switches to `alpine:latest` because scripts use bash-specific syntax.

### Terraform and Infrastructure as Code

Terraform uses a declarative language (HCL), not bash. But bash scripts remain essential around Terraform:
- Pre-terraform: setting environment variables, authenticating to cloud providers
- Post-terraform: extracting outputs, running smoke tests, configuring deployed resources
- Provisioners: Terraform's `local-exec` and `remote-exec` provisioners run bash commands
- Wrapper scripts: `terraform init && terraform plan -out=plan.tfplan && terraform apply plan.tfplan`

Terraform holds 34.28% of the configuration management market. Its declarative approach is complementary to bash, not a replacement --- bash handles the imperative glue around declarative infrastructure.

## Practical Applications

### Writing Portable Shell Scripts

For maximum compatibility across platforms (Alpine, macOS, WSL, CI runners):

```bash
#!/bin/sh
# Use #!/bin/sh instead of #!/bin/bash for portability
# Avoid bash-specific syntax:
#   - No [[ ]] (use [ ] instead)
#   - No (( )) for arithmetic (use $(( )) instead)
#   - No arrays
#   - No ${var,,} case conversion
#   - No process substitution <(cmd)

set -eu  # -o pipefail is a bash extension; omit for POSIX

# Check if bash is available when you need it
if command -v bash > /dev/null 2>&1; then
    echo "Bash is available: $(bash --version | head -1)"
else
    echo "Bash not found, using POSIX sh"
fi
```

### Detecting the Shell Environment

For AI agents that need to adapt to their environment:

```bash
# Detect shell
if [ -n "${BASH_VERSION:-}" ]; then
    echo "Running in Bash $BASH_VERSION"
elif [ -n "${ZSH_VERSION:-}" ]; then
    echo "Running in Zsh $ZSH_VERSION"
else
    echo "Running in POSIX sh or unknown shell"
fi

# Detect OS
case "$(uname -s)" in
    Linux*)   OS="linux" ;;
    Darwin*)  OS="macos" ;;
    MINGW*)   OS="windows-gitbash" ;;
    *)        OS="unknown" ;;
esac

# Detect container
if [ -f /.dockerenv ]; then
    echo "Running inside Docker"
fi
```

### Cross-Platform CI Configuration

```yaml
# GitHub Actions: explicit shell for all platforms
defaults:
  run:
    shell: bash

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          set -euo pipefail
          # Works on all three platforms with shell: bash
          echo "Running on $(uname -s)"
          ./run-tests.sh
```

## Tradeoffs

### Portability vs. Features

POSIX sh is maximally portable but lacks associative arrays, `[[ ]]` test syntax, process substitution, and many conveniences. Bash adds these features at the cost of requiring bash to be installed. The decision depends on your target environment:
- **Containers and CI:** Consider POSIX sh if Alpine is in the mix
- **Developer machines:** Bash is fine; install via Homebrew on macOS if needed
- **Production scripts:** Match the deployment target's available shell

### Cloud Shells vs. Local Environments

Cloud shells are convenient but have limitations: session timeouts (usually 20-60 minutes of inactivity), limited compute resources, and no root access in some cases. They are best for quick tasks, not sustained development. Local bash environments offer full control but require configuration.

### WSL2 vs. Native

WSL2 provides excellent Linux compatibility on Windows, but filesystem operations across the Windows/Linux boundary are slow (accessing `/mnt/c/` from WSL). Keep project files in the Linux filesystem (`/home/user/`) for performance. Docker integration via WSL2 backend works well but adds memory overhead.

## Conclusion

Bash's reach extends across every platform where code runs: native on Linux, available on macOS (with caveats), accessible on Windows through WSL2, embedded in Docker containers (except Alpine and distroless), pre-configured in cloud shells, and assumed by CI/CD pipelines. This ubiquity is precisely why AI agents chose it as their interface --- an agent that speaks bash can operate on any of these platforms.

But ubiquity is not uniformity. The differences between bash 3.2 (macOS), bash 5.3 (current Linux), ash (Alpine), and zsh (macOS default) matter for script portability. The best practice for agent developers is to target POSIX sh for maximum compatibility and reach for bash-specific features only when the environment is known.

---

*Next in the series: [The Modern Bash Ecosystem: Tooling, Testing, and What Comes Next](post-04.md) --- ShellCheck, shfmt, bats-core, Bash 5.3, and modern alternatives.*
