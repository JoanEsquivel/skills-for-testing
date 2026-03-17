# ============================================================================
# QA AUTOMATION INTERVIEW - LIVE CODING SOLUTIONS (Python)
# 12 Problems x 3 Approaches: Best | Mid | Worst
# All snippets are runnable as-is with Python 3.8+
# ============================================================================

import re
from collections import Counter

# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM 1: PALINDROME CHECKING
# ─────────────────────────────────────────────────────────────────────────────


# WORST – creates reversed copy, O(n) extra space
def is_palindrome_worst(s: str) -> bool:
    if s is None:
        return False
    cleaned = re.sub(r"[^a-z0-9]", "", s.lower())
    return cleaned == cleaned[::-1]


# MID – explicit loop comparison
def is_palindrome_mid(s: str) -> bool:
    if s is None:
        return False
    cleaned = re.sub(r"[^a-z0-9]", "", s.lower())
    length = len(cleaned)
    for i in range(length // 2):
        if cleaned[i] != cleaned[length - 1 - i]:
            return False
    return True


# BEST – two-pointer on original, skips non-alnum, O(1) extra space
def is_palindrome_best(s: str) -> bool:
    if s is None:
        return False
    left, right = 0, len(s) - 1
    while left < right:
        if not s[left].isalnum():
            left += 1
            continue
        if not s[right].isalnum():
            right -= 1
            continue
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True


print("=== PROBLEM 1: Palindrome ===")
for text in ["racecar", "A man, a plan, a canal: Panama", "hello", "", "a", None]:
    w = is_palindrome_worst(text)
    m = is_palindrome_mid(text)
    b = is_palindrome_best(text)
    print(f'  "{text}" => worst:{w} mid:{m} best:{b}')


# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM 2: STRING REVERSAL (without built-in reverse or slicing)
# ─────────────────────────────────────────────────────────────────────────────


# WORST – string concatenation in loop, O(n^2) due to immutable strings
def reverse_string_worst(s: str) -> str:
    if s is None:
        return ""
    result = ""
    for i in range(len(s) - 1, -1, -1):
        result += s[i]
    return result


# MID – list append + join, O(n) but builds from right to left
def reverse_string_mid(s: str) -> str:
    if s is None:
        return ""
    chars = []
    for i in range(len(s) - 1, -1, -1):
        chars.append(s[i])
    return "".join(chars)


# BEST – in-place swap on list, O(n) time, O(n) space (unavoidable for str)
def reverse_string_best(s: str) -> str:
    if s is None:
        return ""
    chars = list(s)
    left, right = 0, len(chars) - 1
    while left < right:
        chars[left], chars[right] = chars[right], chars[left]
        left += 1
        right -= 1
    return "".join(chars)


print("\n=== PROBLEM 2: String Reversal ===")
for text in ["hello", "abcdef", "", "a", None]:
    print(f'  "{text}" => worst:"{reverse_string_worst(text)}" mid:"{reverse_string_mid(text)}" best:"{reverse_string_best(text)}"')


# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM 3: ANAGRAM DETECTION
# ─────────────────────────────────────────────────────────────────────────────


# WORST – sort both, O(n log n)
def is_anagram_worst(a: str, b: str) -> bool:
    if a is None or b is None:
        return False
    clean = lambda s: sorted(s.lower().replace(" ", ""))
    return clean(a) == clean(b)


# MID – two Counters, compare
def is_anagram_mid(a: str, b: str) -> bool:
    if a is None or b is None:
        return False
    count = lambda s: Counter(s.lower().replace(" ", ""))
    return count(a) == count(b)


# BEST – single dict, increment/decrement, O(n) time
def is_anagram_best(a: str, b: str) -> bool:
    if a is None or b is None:
        return False
    clean_a = a.lower().replace(" ", "")
    clean_b = b.lower().replace(" ", "")
    if len(clean_a) != len(clean_b):
        return False
    freq = {}
    for ch in clean_a:
        freq[ch] = freq.get(ch, 0) + 1
    for ch in clean_b:
        if freq.get(ch, 0) == 0:
            return False
        freq[ch] -= 1
    return True


print("\n=== PROBLEM 3: Anagram Detection ===")
for a, b in [("listen", "silent"), ("hello", "world"), ("Astronomer", "Moon starer"), ("", ""), (None, "a")]:
    print(f'  "{a}" vs "{b}" => worst:{is_anagram_worst(a, b)} mid:{is_anagram_mid(a, b)} best:{is_anagram_best(a, b)}')


# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM 4: DUPLICATE CHARACTER DETECTION & COUNTING
# ─────────────────────────────────────────────────────────────────────────────


# WORST – nested loop, O(n^2)
def dup_chars_worst(s: str) -> dict:
    if s is None:
        return {}
    s = s.lower()
    result = {}
    for i, ch in enumerate(s):
        if ch == " ":
            continue
        count = sum(1 for c in s if c == ch)
        if count > 1:
            result[ch] = count
    return result


# MID – Counter, then filter
def dup_chars_mid(s: str) -> dict:
    if s is None:
        return {}
    freq = Counter(s.lower().replace(" ", ""))
    return {ch: count for ch, count in freq.items() if count > 1}


# BEST – single-pass dict, then filter
def dup_chars_best(s: str) -> dict:
    if s is None:
        return {}
    freq = {}
    for ch in s.lower():
        if ch == " ":
            continue
        freq[ch] = freq.get(ch, 0) + 1
    return {ch: count for ch, count in freq.items() if count > 1}


print("\n=== PROBLEM 4: Duplicate Characters ===")
for text in ["programming", "hello world", "", None]:
    print(f'  "{text}" => worst:{dup_chars_worst(text)} mid:{dup_chars_mid(text)} best:{dup_chars_best(text)}')


# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM 5: FIZZBUZZ
# ─────────────────────────────────────────────────────────────────────────────


# WORST – explicit if/elif chain
def fizzbuzz_worst(n: int) -> list:
    result = []
    for i in range(1, n + 1):
        if i % 3 == 0 and i % 5 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result


# MID – string building, avoids redundant checks
def fizzbuzz_mid(n: int) -> list:
    result = []
    for i in range(1, n + 1):
        s = ""
        if i % 3 == 0:
            s += "Fizz"
        if i % 5 == 0:
            s += "Buzz"
        result.append(s or str(i))
    return result


# BEST – extensible with custom rules
def fizzbuzz_best(n: int, rules: list[tuple[int, str]] = None) -> list:
    if rules is None:
        rules = [(3, "Fizz"), (5, "Buzz")]
    result = []
    for i in range(1, n + 1):
        s = "".join(word for div, word in rules if i % div == 0)
        result.append(s or str(i))
    return result


print("\n=== PROBLEM 5: FizzBuzz (1-20) ===")
print(f"  worst: {fizzbuzz_worst(20)}")
print(f"  mid:   {fizzbuzz_mid(20)}")
print(f"  best:  {fizzbuzz_best(20)}")
print(f"  best (custom): {fizzbuzz_best(20, [(2, 'Fizz'), (7, 'Buzz')])}")


# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM 6: TWO SUM
# ─────────────────────────────────────────────────────────────────────────────


# WORST – brute force, O(n^2)
def two_sum_worst(nums: list, target: int):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return None


# MID – sort + two pointers, O(n log n)
def two_sum_mid(nums: list, target: int):
    indexed = sorted(enumerate(nums), key=lambda x: x[1])
    left, right = 0, len(indexed) - 1
    while left < right:
        total = indexed[left][1] + indexed[right][1]
        if total == target:
            return [indexed[left][0], indexed[right][0]]
        if total < target:
            left += 1
        else:
            right -= 1
    return None


# BEST – hash map, O(n) time, O(n) space
def two_sum_best(nums: list, target: int):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return None


print("\n=== PROBLEM 6: Two Sum ===")
nums6 = [2, 7, 11, 15]
print(f"  {nums6} target=9  => worst:{two_sum_worst(nums6, 9)} mid:{two_sum_mid(nums6, 9)} best:{two_sum_best(nums6, 9)}")
print(f"  {nums6} target=99 => worst:{two_sum_worst(nums6, 99)} mid:{two_sum_mid(nums6, 99)} best:{two_sum_best(nums6, 99)}")
print(f"  [] target=1       => worst:{two_sum_worst([], 1)} mid:{two_sum_mid([], 1)} best:{two_sum_best([], 1)}")


# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM 7: FIBONACCI SEQUENCE
# ─────────────────────────────────────────────────────────────────────────────


# WORST – naive recursion, O(2^n)
def fib_worst(n: int) -> list:
    if n < 0:
        return []

    def _fib(k):
        if k <= 1:
            return k
        return _fib(k - 1) + _fib(k - 2)

    return [_fib(i) for i in range(n + 1)]


# MID – iterative with list, O(n) time, O(n) space
def fib_mid(n: int) -> list:
    if n < 0:
        return []
    if n == 0:
        return [0]
    seq = [0, 1]
    for i in range(2, n + 1):
        seq.append(seq[i - 1] + seq[i - 2])
    return seq


# BEST – iterative with constant space, O(n) time
def fib_best(n: int) -> list:
    if n < 0:
        return []
    if n == 0:
        return [0]
    result = [0, 1]
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
        result.append(curr)
    return result


print("\n=== PROBLEM 7: Fibonacci (first 10) ===")
print(f"  worst: {fib_worst(9)}")
print(f"  mid:   {fib_mid(9)}")
print(f"  best:  {fib_best(9)}")
print(f"  edge (n=0): {fib_best(0)}  edge (n=-1): {fib_best(-1)}")


# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM 8: ARRAY DEDUPLICATION
# ─────────────────────────────────────────────────────────────────────────────


# WORST – nested loop, O(n^2)
def dedupe_worst(arr: list) -> list:
    if not isinstance(arr, list):
        return []
    result = []
    for item in arr:
        if item not in result:
            result.append(item)
    return result


# MID – dict.fromkeys preserves order, O(n)
def dedupe_mid(arr: list) -> list:
    if not isinstance(arr, list):
        return []
    return list(dict.fromkeys(arr))


# BEST – set for speed, preserves order (Python 3.7+ dict ordering not needed here)
def dedupe_best(arr: list) -> list:
    if not isinstance(arr, list):
        return []
    seen = set()
    result = []
    for item in arr:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


print("\n=== PROBLEM 8: Array Deduplication ===")
arr8 = [1, 2, 3, 2, 4, 1, 5, 3]
print(f"  {arr8} => worst:{dedupe_worst(arr8)} mid:{dedupe_mid(arr8)} best:{dedupe_best(arr8)}")
print(f"  [] => best:{dedupe_best([])}")
print(f"  None => best:{dedupe_best(None)}")


# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM 9: FIND MAX/MIN AND SECOND LARGEST
# ─────────────────────────────────────────────────────────────────────────────


# WORST – sort first, O(n log n)
def second_largest_worst(arr: list):
    if not isinstance(arr, list) or len(arr) < 2:
        return None
    unique = sorted(set(arr), reverse=True)
    return unique[1] if len(unique) >= 2 else None


# MID – two passes
def second_largest_mid(arr: list):
    if not isinstance(arr, list) or len(arr) < 2:
        return None
    max_val = max(arr)
    filtered = [x for x in arr if x != max_val]
    return max(filtered) if filtered else None


# BEST – single pass, O(n) time, O(1) space
def second_largest_best(arr: list):
    if not isinstance(arr, list) or len(arr) < 2:
        return None
    first = second = float("-inf")
    for n in arr:
        if n > first:
            second = first
            first = n
        elif n > second and n != first:
            second = n
    return None if second == float("-inf") else second


print("\n=== PROBLEM 9: Second Largest ===")
for a in [[3, 1, 4, 1, 5, 9, 2, 6], [5, 5, 5], [42], [], [1, 2], [-3, -1, -7]]:
    print(f"  {a} => worst:{second_largest_worst(a)} mid:{second_largest_mid(a)} best:{second_largest_best(a)}")


# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM 10: ARRAY SORTING WITHOUT BUILT-INS
# ─────────────────────────────────────────────────────────────────────────────


# WORST – bubble sort, O(n^2), stable
def sort_bubble(arr: list) -> list:
    if not isinstance(arr, list):
        return []
    a = arr[:]
    n = len(a)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
    return a


# MID – selection sort, O(n^2), fewer swaps
def sort_selection(arr: list) -> list:
    if not isinstance(arr, list):
        return []
    a = arr[:]
    n = len(a)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if a[j] < a[min_idx]:
                min_idx = j
        if min_idx != i:
            a[i], a[min_idx] = a[min_idx], a[i]
    return a


# BEST – merge sort, O(n log n), stable
def sort_merge(arr: list) -> list:
    if not isinstance(arr, list):
        return []
    if len(arr) <= 1:
        return arr[:]

    mid = len(arr) // 2
    left = sort_merge(arr[:mid])
    right = sort_merge(arr[mid:])

    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged


print("\n=== PROBLEM 10: Sorting ===")
arr10 = [64, 34, 25, 12, 22, 11, 90]
print(f"  {arr10}")
print(f"  bubble:    {sort_bubble(arr10)}")
print(f"  selection: {sort_selection(arr10)}")
print(f"  merge:     {sort_merge(arr10)}")
print(f"  empty:     {sort_merge([])}")
print(f"  single:    {sort_merge([1])}")


# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM 11: INPUT VALIDATION (Email)
# ─────────────────────────────────────────────────────────────────────────────


# WORST – just checks for @ and dot
def validate_email_worst(email: str) -> bool:
    if email is None:
        return False
    return "@" in email and "." in email


# MID – manual structural validation
def validate_email_mid(email: str) -> bool:
    if not isinstance(email, str):
        return False
    trimmed = email.strip()
    if not trimmed or len(trimmed) > 254:
        return False

    at_idx = trimmed.find("@")
    if at_idx < 1:
        return False
    if trimmed.count("@") > 1:
        return False

    local = trimmed[:at_idx]
    domain = trimmed[at_idx + 1:]

    if not local or len(local) > 64:
        return False
    if not domain:
        return False

    parts = domain.split(".")
    if len(parts) < 2:
        return False
    if any(len(p) == 0 for p in parts):
        return False
    if len(parts[-1]) < 2:
        return False

    return True


# BEST – regex per RFC 5322 simplified + structural checks
def validate_email_best(email: str) -> bool:
    if not isinstance(email, str):
        return False
    trimmed = email.strip()
    if not trimmed or len(trimmed) > 254:
        return False
    pattern = r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, trimmed))


print("\n=== PROBLEM 11: Email Validation ===")
for email in ["user@example.com", "bad@", "@no.com", "double@@at.com", "spaces @x.com", "", None, "a@b.c", "valid+tag@gmail.com"]:
    print(f'  "{email}" => worst:{validate_email_worst(email)} mid:{validate_email_mid(email)} best:{validate_email_best(email)}')


# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM 12: LOG FILE PARSING & DATA AGGREGATION
# ─────────────────────────────────────────────────────────────────────────────

SAMPLE_LOG = """2024-01-15 10:23:01 ERROR Database connection timeout
2024-01-15 10:23:05 INFO  Retrying connection
2024-01-15 10:23:10 ERROR Database connection timeout
2024-01-15 10:23:15 WARN  High memory usage detected
2024-01-15 10:24:00 INFO  Connection established
2024-01-15 10:25:30 ERROR File not found: /tmp/data.csv
2024-01-15 10:26:00 INFO  Request processed successfully
MALFORMED LINE WITHOUT PROPER FORMAT
2024-01-15 10:27:00 DEBUG Cache miss for key user:123"""


# WORST – naive split, no error handling
def parse_log_worst(log: str) -> dict:
    counts = {}
    for line in log.split("\n"):
        parts = line.split()
        if len(parts) >= 3:
            level = parts[2]
            counts[level] = counts.get(level, 0) + 1
    return counts


# MID – regex parsing with malformed line handling
def parse_log_mid(log: str) -> dict:
    pattern = re.compile(
        r"^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})\s+(ERROR|WARN|INFO|DEBUG)\s+(.+)$"
    )
    counts = {}
    errors = []
    malformed = []

    for line in log.split("\n"):
        match = pattern.match(line)
        if not match:
            if line.strip():
                malformed.append(line)
            continue
        _, _, level, message = match.groups()
        counts[level] = counts.get(level, 0) + 1
        if level == "ERROR":
            errors.append(message)

    return {"counts": counts, "errors": errors, "malformed": malformed}


# BEST – structured parsing with full aggregation
def parse_log_best(log: str) -> dict:
    if not isinstance(log, str):
        return {"counts": {}, "top_errors": [], "time_range": None, "malformed": []}

    pattern = re.compile(
        r"^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s+(ERROR|WARN|INFO|DEBUG)\s+(.+)$"
    )
    counts = {}
    error_messages = {}
    malformed = []
    earliest = None
    latest = None

    lines = [l for l in log.split("\n") if l.strip()]

    for line in lines:
        match = pattern.match(line)
        if not match:
            malformed.append(line)
            continue
        timestamp, level, message = match.groups()
        counts[level] = counts.get(level, 0) + 1

        if earliest is None or timestamp < earliest:
            earliest = timestamp
        if latest is None or timestamp > latest:
            latest = timestamp

        if level == "ERROR":
            error_messages[message] = error_messages.get(message, 0) + 1

    top_errors = sorted(error_messages.items(), key=lambda x: -x[1])
    top_errors = [{"message": msg, "count": cnt} for msg, cnt in top_errors]

    return {
        "counts": counts,
        "top_errors": top_errors,
        "time_range": {"from": earliest, "to": latest} if earliest else None,
        "malformed": malformed,
        "total_lines": len(lines),
        "valid_lines": len(lines) - len(malformed),
    }


print("\n=== PROBLEM 12: Log Parsing ===")
print(f"  worst: {parse_log_worst(SAMPLE_LOG)}")

import json
print(f"  mid:   {json.dumps(parse_log_mid(SAMPLE_LOG), indent=2)}")
print(f"  best:  {json.dumps(parse_log_best(SAMPLE_LOG), indent=2)}")
