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


# ── WORST: Reversed Copy ──
# What it does: Checks if a string reads the same forwards and backwards,
# ignoring spaces, punctuation, and capitalization.
#
# How it works, step by step:
#   1. First we guard against None input — calling .lower() on None would crash
#   2. Then we use re.sub(r"[^a-z0-9]", "", s.lower()) to strip everything
#      except lowercase letters and digits (the regex [^a-z0-9] matches any
#      character that is NOT a letter or digit, and we replace it with "")
#   3. Finally we compare cleaned == cleaned[::-1] — the [::-1] is Python slice
#      syntax (start:stop:step with step=-1 means "go backwards"), so it creates
#      a full reversed copy of the string
#
# Why this is "worst": It allocates a whole new string just for the reversed
# copy. Think of it like photocopying an entire book backwards just to check
# if it's the same — it works, but you used a lot of paper.
#
# Interview tip: "Say this in the interview: 'This is the simplest approach
# but it uses O(n) extra memory for the reversed copy. I can do better with
# two pointers.'"
#
# Complexity: O(n) time, O(n) space.
def is_palindrome_worst(s: str) -> bool:
    if s is None:
        return False
    cleaned = re.sub(r"[^a-z0-9]", "", s.lower())
    return cleaned == cleaned[::-1]


# ── MID: Explicit Loop Comparison ──
# What it does: Checks if a string is a palindrome by manually comparing
# characters from the front and back using a for loop.
#
# How it works, step by step:
#   1. First we clean the string the same way as worst — None check, then
#      re.sub() to keep only lowercase alphanumeric characters
#   2. Then we loop from index 0 up to the halfway point (length // 2) —
#      we only need to check half because we're comparing pairs
#   3. For each index i, we compare cleaned[i] with cleaned[length - 1 - i]
#      (its mirror character from the end). If any pair doesn't match, we
#      immediately return False — no need to keep checking
#
# Why this is "mid": It still creates the cleaned string (O(n) space), but
# it avoids creating a second reversed copy. Think of it like reading a book
# from both ends simultaneously instead of photocopying it backwards first.
#
# Interview tip: "Say this in the interview: 'I'm comparing characters
# symmetrically from both ends, which avoids creating a reversed copy, but
# I can optimize further by skipping the cleaning step entirely.'"
#
# Complexity: O(n) time, O(n) space (for the cleaned string).
def is_palindrome_mid(s: str) -> bool:
    if s is None:
        return False
    cleaned = re.sub(r"[^a-z0-9]", "", s.lower())
    length = len(cleaned)
    for i in range(length // 2):
        if cleaned[i] != cleaned[length - 1 - i]:
            return False
    return True


# ── BEST: Two-Pointer on Original String ──
# What it does: Checks for a palindrome without ever creating a cleaned copy
# of the string. It works directly on the original input using two pointers.
#
# How it works, step by step:
#   1. First we set up two pointers: left starts at the beginning (0),
#      right starts at the end (len(s) - 1)
#   2. We move the pointers toward each other. If s[left] is not alphanumeric
#      (like a space or punctuation), we skip it by doing left += 1. Same
#      idea for s[right] — we use .isalnum() to check
#   3. When both pointers land on valid characters, we compare them
#      case-insensitively with .lower(). If they don't match, it's not a
#      palindrome. If they match, we move both pointers inward and continue
#
# Why this is "best": No extra string is created at all — we just walk two
# pointers toward the middle. It's like checking a book by having two people
# read from opposite ends, skipping blank pages, without making any copies.
#
# Interview tip: "Say this in the interview: 'The two-pointer approach gives
# us O(1) extra space because we never allocate a cleaned string — we skip
# non-alphanumeric characters in place.'"
#
# Complexity: O(n) time, O(1) space.
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


# ── WORST: String Concatenation in Loop ──
# What it does: Reverses a string by building a new string one character at a
# time, reading from the end of the input to the beginning.
#
# How it works, step by step:
#   1. First we check for None — if the input is None, we return an empty
#      string to avoid a crash
#   2. We start with an empty string result = "" and loop backwards using
#      range(len(s) - 1, -1, -1) — that's Python for "start at the last
#      index, go down to 0, stepping by -1"
#   3. Each iteration does result += s[i], which appends one character.
#      But here's the catch: Python strings are immutable, so every += creates
#      a brand new string by copying all previous characters plus the new one
#
# Why this is "worst": Because strings are immutable in Python, each +=
# copies the entire string so far. For a string of length n, you end up
# copying 1 + 2 + 3 + ... + n characters total. It's like rewriting an
# entire letter from scratch every time you want to add one more word.
#
# Interview tip: "Say this in the interview: 'String concatenation in a loop
# is O(n^2) in Python because strings are immutable — each += allocates a
# new string and copies everything over.'"
#
# Complexity: O(n^2) time, O(n) space.
def reverse_string_worst(s: str) -> str:
    if s is None:
        return ""
    result = ""
    for i in range(len(s) - 1, -1, -1):
        result += s[i]
    return result


# ── MID: List Append + Join ──
# What it does: Reverses a string by collecting characters into a list (from
# back to front), then joining them into a single string at the end.
#
# How it works, step by step:
#   1. First we handle the None edge case, returning ""
#   2. We create an empty list chars = [] and loop backwards through the
#      string using range(len(s) - 1, -1, -1)
#   3. Each iteration appends s[i] to the list — list.append() is O(1)
#      amortized, unlike string concatenation
#   4. Finally, "".join(chars) glues all the characters together into one
#      string in a single pass — much faster than repeated +=
#
# Why this is "mid": Using a list avoids the O(n^2) trap of string
# concatenation because list appends are cheap. Think of it like collecting
# playing cards into a pile (fast) versus gluing them onto a growing poster
# one by one (slow because you keep making a bigger poster). The join at
# the end is one efficient operation.
#
# Interview tip: "Say this in the interview: 'I use a list to collect
# characters because list.append() is O(1), then join them once at the end
# — this avoids the O(n^2) cost of repeated string concatenation.'"
#
# Complexity: O(n) time, O(n) space.
def reverse_string_mid(s: str) -> str:
    if s is None:
        return ""
    chars = []
    for i in range(len(s) - 1, -1, -1):
        chars.append(s[i])
    return "".join(chars)


# ── BEST: In-Place Swap on List ──
# What it does: Reverses a string by converting it to a list of characters,
# then swapping characters from opposite ends moving inward — the classic
# two-pointer technique.
#
# How it works, step by step:
#   1. First we handle None, then convert the string to a list with list(s)
#      — we need a list because Python strings are immutable (you can't swap
#      characters in a string directly)
#   2. We set up two pointers: left = 0 and right = len(chars) - 1
#   3. In each loop iteration we swap chars[left] and chars[right] using
#      Python's tuple swap syntax (a, b = b, a), then move both pointers
#      inward. We stop when left >= right (they've met in the middle)
#   4. Finally, "".join(chars) converts the list back to a string
#
# Why this is "best": The swap approach is the textbook in-place reversal
# algorithm. In languages like C or Java (with char arrays), this would be
# truly O(1) extra space. In Python we still need O(n) for the list because
# strings are immutable, but this demonstrates the optimal algorithm.
#
# Interview tip: "Say this in the interview: 'I convert to a list to enable
# in-place swaps with two pointers — this is the classic O(n) reversal
# algorithm and shows I understand mutability constraints in Python.'"
#
# Complexity: O(n) time, O(n) space (unavoidable in Python due to immutable strings).
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


# ── WORST: Sort Both Strings ──
# What it does: Checks if two strings are anagrams (contain the exact same
# letters, just rearranged) by sorting both and comparing.
#
# How it works, step by step:
#   1. First we guard against None inputs — if either is None, return False
#   2. We define a lambda called clean that lowercases the string, removes
#      spaces, and then sorts the characters into a list using sorted()
#   3. If clean(a) == clean(b), the sorted character lists are identical,
#      meaning both strings have the same letters in the same quantities
#
# Why this is "worst": Sorting takes O(n log n) time, which is slower than
# just counting characters in O(n). It's like alphabetizing two decks of
# cards to see if they match — it works, but counting the cards by type
# would be faster.
#
# Interview tip: "Say this in the interview: 'Sorting both strings works
# but costs O(n log n). I can do this in O(n) by counting character
# frequencies instead.'"
#
# Complexity: O(n log n) time, O(n) space.
def is_anagram_worst(a: str, b: str) -> bool:
    if a is None or b is None:
        return False
    clean = lambda s: sorted(s.lower().replace(" ", ""))
    return clean(a) == clean(b)


# ── MID: Two Counters ──
# What it does: Checks if two strings are anagrams by counting character
# frequencies with Python's Counter class and comparing the two counts.
#
# How it works, step by step:
#   1. First we guard against None inputs
#   2. We define a lambda that lowercases, removes spaces, and wraps the
#      result in Counter() — a dict subclass from collections that counts
#      how many times each element appears (e.g., Counter("aab") = {'a':2, 'b':1})
#   3. We compare count(a) == count(b) — Counter objects support equality
#      checks, so this returns True if every character appears the same
#      number of times in both strings
#
# Why this is "mid": It's O(n) time (counting is linear), which is better
# than sorting. But it builds two separate Counter objects, using roughly
# 2x the space needed. It's like making two shopping lists and comparing
# them — efficient, but you could get by with just one list.
#
# Interview tip: "Say this in the interview: 'Counter gives us O(n) time,
# but I'm building two separate frequency maps. I can optimize space by
# using a single dict with increment and decrement.'"
#
# Complexity: O(n) time, O(n) space (two Counter dicts).
def is_anagram_mid(a: str, b: str) -> bool:
    if a is None or b is None:
        return False
    count = lambda s: Counter(s.lower().replace(" ", ""))
    return count(a) == count(b)


# ── BEST: Single Dict Increment/Decrement ──
# What it does: Checks if two strings are anagrams using a single frequency
# dictionary — characters from the first string increment counts, characters
# from the second string decrement them.
#
# How it works, step by step:
#   1. First we guard against None, clean both strings (lowercase, strip spaces)
#   2. Quick length check: if they differ in length, they can't be anagrams
#   3. We build a freq dict from clean_a using dict.get(ch, 0) + 1 — the
#      .get(ch, 0) returns 0 if the key doesn't exist yet, avoiding a KeyError
#   4. Then we loop through clean_b: for each character, if freq.get(ch, 0)
#      is already 0, that character appears more in b than in a, so return
#      False. Otherwise, decrement freq[ch] by 1
#   5. If we finish the loop without returning False, all counts balanced out
#
# Why this is "best": We use only one dictionary instead of two. It's like
# having a single checklist — you check off items as you pack a box (string a),
# then uncheck them as you unpack another (string b). If everything cancels
# out, the boxes had the same contents.
#
# Interview tip: "Say this in the interview: 'One dict with increment and
# decrement gives me O(n) time and minimal space — plus the early length
# check lets me fail fast.'"
#
# Complexity: O(n) time, O(k) space where k is the number of unique characters.
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


# ── WORST: Nested Loop with sum() ──
# What it does: Finds characters that appear more than once in a string and
# returns a dict mapping each duplicate character to its count.
#
# How it works, step by step:
#   1. First we handle None, then lowercase the string for case-insensitive matching
#   2. We loop through every character using enumerate(s) — enumerate gives us
#      both the index i and the character ch (though we only really need ch here)
#   3. We skip spaces with "if ch == ' ': continue"
#   4. For each character, we count how many times it appears in the entire
#      string using sum(1 for c in s if c == ch) — this is a generator
#      expression that scans the whole string again for every single character
#   5. If the count is greater than 1, we add it to the result dict
#
# Why this is "worst": For every character (n total), we scan the entire
# string again (n comparisons), giving us O(n^2). It's like checking every
# student in a classroom against every other student to find twins — when
# you could just take attendance and look for repeated names.
#
# Interview tip: "Say this in the interview: 'This nested approach is O(n^2)
# because the inner sum() rescans the entire string for each character. A
# single-pass frequency dict would be O(n).'"
#
# Complexity: O(n^2) time, O(k) space where k is the number of unique characters.
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


# ── MID: Counter + Dict Comprehension ──
# What it does: Finds duplicate characters using Python's Counter class,
# then filters to keep only characters appearing more than once.
#
# How it works, step by step:
#   1. First we handle None
#   2. We build a Counter from s.lower().replace(" ", "") — Counter counts
#      every character's frequency in one pass. The .replace(" ", "") strips
#      out spaces before counting
#   3. We use a dict comprehension {ch: count for ch, count in freq.items()
#      if count > 1} to filter out characters that appear only once
#
# Why this is "mid": Counter does the counting in O(n), which is great. But
# Counter is a heavyweight object (a dict subclass with extra methods), and
# we're relying on a library import. Think of it like using a power tool for
# a simple job — it works perfectly, but you're bringing more equipment than
# strictly necessary.
#
# Interview tip: "Say this in the interview: 'Counter gives me a clean O(n)
# solution in two lines, but I can also do this with a plain dict to show
# I understand the mechanics under the hood.'"
#
# Complexity: O(n) time, O(k) space.
def dup_chars_mid(s: str) -> dict:
    if s is None:
        return {}
    freq = Counter(s.lower().replace(" ", ""))
    return {ch: count for ch, count in freq.items() if count > 1}


# ── BEST: Single-Pass Dict ──
# What it does: Finds duplicate characters using a plain dict built in a
# single pass, then filters for characters with count > 1.
#
# How it works, step by step:
#   1. First we handle None, then create an empty dict freq = {}
#   2. We loop through each character in s.lower(), skipping spaces
#   3. For each character, freq[ch] = freq.get(ch, 0) + 1 either initializes
#      the count to 1 (if the key doesn't exist yet, .get() returns 0) or
#      increments the existing count. This is a common Python pattern for
#      building frequency maps without defaultdict
#   4. After the loop, a dict comprehension filters for count > 1
#
# Why this is "best": No imports needed, one clean pass through the data,
# uses only a plain dict. It's the "from scratch" approach that shows you
# understand how frequency counting works without leaning on library tools.
# Like counting cards by hand with tally marks — simple, efficient, and
# you can explain every step.
#
# Interview tip: "Say this in the interview: 'I prefer a plain dict with
# .get(ch, 0) for frequency counting — it's O(n), needs no imports, and
# is easy to extend with extra logic if needed.'"
#
# Complexity: O(n) time, O(k) space.
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


# ── WORST: If/Elif Chain ──
# What it does: Implements the classic FizzBuzz problem — for numbers 1 to n,
# print "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for
# both, or the number itself otherwise.
#
# How it works, step by step:
#   1. We loop from 1 to n (inclusive) using range(1, n + 1)
#   2. The if/elif chain checks divisibility by both 3 AND 5 first (this
#      must come first, or "FizzBuzz" would never print — it would match
#      the i % 3 case first)
#   3. Then we check i % 3 alone for "Fizz", i % 5 alone for "Buzz"
#   4. The else catches everything else and appends the number as a string
#
# Why this is "worst": The if/elif chain is rigid — the "divisible by both"
# check is a special case you have to remember to put first. If you wanted
# to add a new rule (like "Jazz" for 7), you'd need to add cases for every
# combination (3+7, 5+7, 3+5+7). It doesn't scale.
#
# Interview tip: "Say this in the interview: 'The if/elif approach works but
# has a combinatorial explosion problem — adding a new rule requires handling
# every possible combination.'"
#
# Complexity: O(n) time, O(n) space.
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


# ── MID: String Building ──
# What it does: Solves FizzBuzz by building up a string for each number —
# concatenating "Fizz" and/or "Buzz" as applicable, falling back to the
# number if the string is empty.
#
# How it works, step by step:
#   1. We loop from 1 to n, starting with s = "" for each number
#   2. If divisible by 3, we append "Fizz" to s. If divisible by 5, we
#      append "Buzz" to s. These are separate if statements (not elif),
#      so both can trigger — giving us "FizzBuzz" naturally without a
#      special combined check
#   3. result.append(s or str(i)) uses Python's "or" trick: if s is empty
#      (falsy), it falls back to str(i). If s has content (truthy), it uses s
#
# Why this is "mid": The string-building approach elegantly handles the
# "FizzBuzz" case without an explicit combined check. No combinatorial
# explosion. But the rules are still hardcoded inside the function — you'd
# have to edit the source code to add new rules.
#
# Interview tip: "Say this in the interview: 'Building the string with
# separate if-checks handles combinations automatically — and the s or
# str(i) idiom is a clean Python pattern for default values.'"
#
# Complexity: O(n) time, O(n) space.
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


# ── BEST: Extensible Rules ──
# What it does: Solves FizzBuzz with a configurable list of (divisor, word)
# rules, so you can easily add new rules like (7, "Jazz") without changing
# the function logic.
#
# How it works, step by step:
#   1. The rules parameter defaults to None; if so, we set the standard
#      rules [(3, "Fizz"), (5, "Buzz")]. We use None instead of a mutable
#      default because mutable default arguments in Python are shared across
#      all calls (a classic Python gotcha)
#   2. For each number, we use a generator expression inside "".join():
#      "".join(word for div, word in rules if i % div == 0) — this builds
#      the combined string by checking every rule in order
#   3. Same s or str(i) fallback pattern as the mid approach
#
# Why this is "best": The function is open for extension but closed for
# modification (Open/Closed Principle). Want to add "Jazz" for 7? Just pass
# a different rules list. No code changes needed. This is the kind of design
# thinking interviewers love to see.
#
# Interview tip: "Say this in the interview: 'I made the rules configurable
# so the function follows the Open/Closed Principle — I can add new FizzBuzz
# rules without modifying the function body.'"
#
# Complexity: O(n * r) time where r is the number of rules, O(n) space.
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


# ── WORST: Brute Force ──
# What it does: Given an array of numbers and a target, finds two numbers
# that add up to the target and returns their indices.
#
# How it works, step by step:
#   1. We use two nested loops: the outer loop picks each number (index i),
#      and the inner loop checks every number after it (index j starts at
#      i + 1 to avoid pairing a number with itself)
#   2. If nums[i] + nums[j] == target, we've found our pair and return
#      their indices as a list [i, j]
#   3. If no pair is found after checking all combinations, we return None
#
# Why this is "worst": Every element is compared with every other element,
# giving us n*(n-1)/2 comparisons. It's like finding two puzzle pieces that
# fit by trying every possible pair — it works, but it's painfully slow for
# large arrays.
#
# Interview tip: "Say this in the interview: 'The brute force checks every
# pair in O(n^2). I can get this down to O(n) with a hash map by storing
# complements as I go.'"
#
# Complexity: O(n^2) time, O(1) space.
def two_sum_worst(nums: list, target: int):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return None


# ── MID: Sort + Two Pointers ──
# What it does: Finds two numbers that sum to the target by sorting the array
# first, then using two pointers to efficiently search for the pair.
#
# How it works, step by step:
#   1. We create indexed = sorted(enumerate(nums), key=lambda x: x[1]) —
#      enumerate(nums) gives us (index, value) pairs, and we sort them by
#      value. We keep the original indices so we can return them later
#   2. We place a left pointer at the start (smallest) and right pointer at
#      the end (largest) of the sorted array
#   3. We compute the sum: if it equals target, return the original indices.
#      If the sum is too small, move left up (to increase the sum). If too
#      large, move right down (to decrease the sum)
#
# Why this is "mid": Sorting costs O(n log n), which is better than brute
# force O(n^2) but worse than the hash map approach. The trick of preserving
# original indices via enumerate is worth noting — without it, sorting would
# lose track of where numbers originally were.
#
# Interview tip: "Say this in the interview: 'Sort + two pointers gives
# O(n log n) without extra space for a hash map, which can be useful if
# memory is constrained.'"
#
# Complexity: O(n log n) time, O(n) space (for the sorted copy).
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


# ── BEST: Hash Map ──
# What it does: Finds two numbers that sum to the target in a single pass
# using a dictionary to remember previously seen numbers.
#
# How it works, step by step:
#   1. We create an empty dict seen = {} that will map each number to its index
#   2. We loop through the array with enumerate(nums) to get both the index i
#      and the value num
#   3. For each number, we compute complement = target - num — this is the
#      value we need to find to complete the pair
#   4. We check "if complement in seen" — dict lookup is O(1) on average.
#      If found, we return [seen[complement], i] (the indices of both numbers)
#   5. If not found, we store seen[num] = i so future iterations can find it
#
# Why this is "best": One pass through the array, O(1) lookups in the hash
# map. It's like walking through a crowd looking for your dance partner —
# as you pass each person, you write their name on a board. When someone
# new arrives, they just check the board instead of asking everyone.
#
# Interview tip: "Say this in the interview: 'The hash map approach trades
# O(n) space for O(n) time — each element is processed once, and dict
# lookups are O(1) average.'"
#
# Complexity: O(n) time, O(n) space.
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


# ── WORST: Naive Recursion ──
# What it does: Generates the Fibonacci sequence up to the nth number using
# a recursive helper function — the classic textbook approach that is elegant
# but extremely slow.
#
# How it works, step by step:
#   1. First we handle negative input by returning an empty list
#   2. We define an inner function _fib(k) that returns the kth Fibonacci
#      number: base cases are _fib(0)=0 and _fib(1)=1, and for k>1 it
#      returns _fib(k-1) + _fib(k-2)
#   3. We use a list comprehension [_fib(i) for i in range(n + 1)] to
#      build the full sequence by calling _fib for each position
#
# Why this is "worst": Each call to _fib branches into two more calls,
# creating an exponential tree of redundant work. _fib(5) computes _fib(3)
# twice, _fib(2) three times, etc. It's like asking "what's fib(50)?" and
# having to recount from scratch for every sub-problem. For n=30, that's
# already over a billion operations.
#
# Interview tip: "Say this in the interview: 'Naive recursion is O(2^n)
# because of overlapping subproblems — the same Fibonacci values get
# recomputed exponentially many times. I'd use iteration instead.'"
#
# Complexity: O(2^n) time per call to _fib, O(n) space (call stack depth).
def fib_worst(n: int) -> list:
    if n < 0:
        return []

    def _fib(k):
        if k <= 1:
            return k
        return _fib(k - 1) + _fib(k - 2)

    return [_fib(i) for i in range(n + 1)]


# ── MID: Iterative with List ──
# What it does: Generates the Fibonacci sequence iteratively by building up
# a list where each new value is the sum of the previous two.
#
# How it works, step by step:
#   1. First we handle edge cases: n < 0 returns [], n == 0 returns [0]
#   2. We start the list with seq = [0, 1] (the first two Fibonacci numbers)
#   3. We loop from 2 to n, appending seq[i-1] + seq[i-2] each time. Since
#      all previous values are stored in the list, we can look them up
#      directly by index — no redundant computation
#
# Why this is "mid": It's O(n) time (huge improvement over recursion) and
# easy to understand. But it stores the entire sequence in the list even
# while computing — if you only needed the last number, you'd be wasting
# memory. Think of it like writing down every answer on a chalkboard when
# you only need the latest two to compute the next one.
#
# Interview tip: "Say this in the interview: 'The iterative list approach
# eliminates redundant computation, giving O(n) time. But I can optimize
# space by only tracking the last two values.'"
#
# Complexity: O(n) time, O(n) space.
def fib_mid(n: int) -> list:
    if n < 0:
        return []
    if n == 0:
        return [0]
    seq = [0, 1]
    for i in range(2, n + 1):
        seq.append(seq[i - 1] + seq[i - 2])
    return seq


# ── BEST: Iterative Constant Space ──
# What it does: Generates the Fibonacci sequence using only two variables
# (prev and curr) to track the computation, appending results to the output
# list as it goes.
#
# How it works, step by step:
#   1. First we handle edge cases: n < 0 returns [], n == 0 returns [0]
#   2. We initialize result = [0, 1] and set prev = 0, curr = 1
#   3. In the loop, prev, curr = curr, prev + curr uses Python's tuple
#      unpacking to update both values simultaneously — this is important
#      because doing them separately (prev = curr; curr = prev + curr)
#      would use the already-updated prev, giving wrong results
#   4. We append curr to result after each swap
#
# Why this is "best": The computation only ever holds two numbers in memory
# (prev and curr), not the entire sequence history. We still need O(n) for
# the result list (because we're asked to return all values), but the
# working memory is O(1). If you only needed the nth value, this would be
# truly O(1) space.
#
# Interview tip: "Say this in the interview: 'I use two variables with
# Python tuple unpacking for a clean O(1) working space solution — only
# the output list requires O(n) space.'"
#
# Complexity: O(n) time, O(1) working space (O(n) for the output list).
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


# ── WORST: "in" Check Loop ──
# What it does: Removes duplicates from a list while preserving the original
# order of first appearances.
#
# How it works, step by step:
#   1. First we validate the input is actually a list using isinstance()
#   2. We create an empty result list
#   3. For each item in the input, we check "if item not in result" — this
#      scans the entire result list linearly to see if the item is already
#      there. If not, we append it
#
# Why this is "worst": The "in" operator on a list is O(n) because it has
# to scan every element. Since we do this for each of the n input items,
# the total is O(n^2). It's like checking a guest list by reading every
# name from the top each time someone new arrives — a sorted list or a
# set would let you look them up instantly.
#
# Interview tip: "Say this in the interview: 'Checking "x in list" is O(n)
# per check, making this O(n^2) overall. A set gives O(1) lookups, bringing
# the total to O(n).'"
#
# Complexity: O(n^2) time, O(n) space.
def dedupe_worst(arr: list) -> list:
    if not isinstance(arr, list):
        return []
    result = []
    for item in arr:
        if item not in result:
            result.append(item)
    return result


# ── MID: dict.fromkeys ──
# What it does: Removes duplicates by leveraging the fact that Python dicts
# cannot have duplicate keys and (since Python 3.7) preserve insertion order.
#
# How it works, step by step:
#   1. First we validate the input with isinstance()
#   2. dict.fromkeys(arr) creates a dict where each element of arr becomes
#      a key (with None as the value). Duplicate elements are silently ignored
#      because a key can only appear once in a dict
#   3. We wrap it in list() to convert the dict keys back into a list
#
# Why this is "mid": It's a clever one-liner that's O(n) time. The downside
# is that it's not immediately obvious what dict.fromkeys does — someone
# reading your code might need to look it up. It's like using a fancy kitchen
# gadget that works perfectly but your friends don't recognize it.
#
# Interview tip: "Say this in the interview: 'dict.fromkeys is a clean
# one-liner for deduplication that preserves order in Python 3.7+, but
# I can also do it explicitly with a set for clarity.'"
#
# Complexity: O(n) time, O(n) space.
def dedupe_mid(arr: list) -> list:
    if not isinstance(arr, list):
        return []
    return list(dict.fromkeys(arr))


# ── BEST: Set-Based ──
# What it does: Removes duplicates using a set for O(1) lookups while
# maintaining insertion order with a separate result list.
#
# How it works, step by step:
#   1. First we validate the input with isinstance()
#   2. We create both a set (seen = set()) for fast lookups and a list
#      (result = []) to maintain order
#   3. For each item, we check "if item not in seen" — set lookups are O(1)
#      average (hash-based), unlike the O(n) list scan in the worst approach
#   4. If the item is new, we add it to both the set and the result list
#
# Why this is "best": The set gives us O(1) membership testing, making the
# overall algorithm O(n). Unlike dict.fromkeys, this approach is explicit
# and readable — anyone can see exactly what's happening. You could also
# easily add filtering logic (e.g., skip None values) inside the loop.
#
# Interview tip: "Say this in the interview: 'I use a set for O(1) lookups
# alongside a list to preserve order — this is explicit, efficient, and
# easy to extend with additional filtering logic.'"
#
# Complexity: O(n) time, O(n) space.
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


# ── WORST: Sort First ──
# What it does: Finds the second largest unique value in an array by sorting
# the unique values and picking the second one.
#
# How it works, step by step:
#   1. First we check that arr is a list with at least 2 elements
#   2. set(arr) removes duplicates (so [5, 5, 3] becomes {5, 3})
#   3. sorted(..., reverse=True) sorts the unique values in descending order
#   4. We return unique[1] if there are at least 2 unique values, else None
#
# Why this is "worst": Sorting is O(n log n) when we only need the top two
# values. It's like organizing your entire bookshelf alphabetically just to
# find the second tallest book — you could just scan the shelf once and
# remember the two tallest.
#
# Interview tip: "Say this in the interview: 'Sorting works but is overkill
# at O(n log n). I only need the top two values, which I can find in a
# single O(n) pass.'"
#
# Complexity: O(n log n) time, O(n) space (for the sorted unique list).
def second_largest_worst(arr: list):
    if not isinstance(arr, list) or len(arr) < 2:
        return None
    unique = sorted(set(arr), reverse=True)
    return unique[1] if len(unique) >= 2 else None


# ── MID: Two Passes ──
# What it does: Finds the second largest value by first finding the max,
# then finding the max of everything that isn't the max.
#
# How it works, step by step:
#   1. First we validate the input (is a list, has at least 2 elements)
#   2. max_val = max(arr) finds the largest value in one pass — O(n)
#   3. We build a filtered list excluding max_val using a list comprehension:
#      [x for x in arr if x != max_val]
#   4. If the filtered list is non-empty, max(filtered) gives us the second
#      largest. If it's empty (all elements were the same), we return None
#
# Why this is "mid": Two passes through the array (one for max, one for
# filtering) is still O(n), which is better than sorting. But we create
# an intermediate filtered list, using extra memory, and we traverse the
# data twice when once would suffice.
#
# Interview tip: "Say this in the interview: 'Two passes is O(n) time, but
# I can do this in a single pass by tracking the top two values in variables,
# avoiding the extra filtered list.'"
#
# Complexity: O(n) time, O(n) space (for the filtered list).
def second_largest_mid(arr: list):
    if not isinstance(arr, list) or len(arr) < 2:
        return None
    max_val = max(arr)
    filtered = [x for x in arr if x != max_val]
    return max(filtered) if filtered else None


# ── BEST: Single Pass ──
# What it does: Finds the second largest unique value in a single scan by
# tracking the two largest values seen so far.
#
# How it works, step by step:
#   1. First we validate the input
#   2. We initialize first = second = float("-inf") — negative infinity is
#      Python's way of saying "smaller than any real number", so any actual
#      value will be larger
#   3. For each number n: if n > first, the current champion drops to second
#      place (second = first) and n becomes the new first. If n isn't bigger
#      than first but IS bigger than second AND isn't equal to first (we want
#      unique values), it becomes the new second
#   4. If second is still -inf at the end, there was no valid second largest
#
# Why this is "best": One pass, two variables, no extra data structures.
# It's the optimal approach — like a race judge who only needs to remember
# the names of the current 1st and 2nd place runners as they cross the
# finish line, not the order of everyone.
#
# Interview tip: "Say this in the interview: 'Single pass with two tracking
# variables gives me O(n) time and O(1) space — the theoretical optimum
# for this problem.'"
#
# Complexity: O(n) time, O(1) space.
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


# ── WORST: Bubble Sort ──
# What it does: Sorts an array by repeatedly "bubbling" the largest unsorted
# element to its correct position at the end.
#
# How it works, step by step:
#   1. First we validate input, then copy the array with arr[:] so we don't
#      modify the original (a good practice for pure functions)
#   2. The outer loop runs n-1 times. The inner loop compares adjacent pairs
#      a[j] and a[j+1] — if they're in the wrong order, we swap them using
#      Python's tuple swap: a[j], a[j+1] = a[j+1], a[j]
#   3. After each outer loop iteration, the largest unsorted element has
#      "bubbled up" to the end, so the inner loop can shrink by one
#      (that's the "n - 1 - i" in the range)
#
# Why this is "worst": O(n^2) comparisons and potentially O(n^2) swaps.
# It's the simplest sorting algorithm to understand but the slowest in
# practice. Like repeatedly going through a shelf and swapping any two
# books that are out of order — you get there eventually, but it takes
# many passes.
#
# Interview tip: "Say this in the interview: 'Bubble sort is O(n^2) and
# mainly useful as a teaching tool. For production code, I'd use merge sort
# or Python's built-in Timsort.'"
#
# Complexity: O(n^2) time, O(n) space (for the copy).
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


# ── MID: Selection Sort ──
# What it does: Sorts an array by repeatedly finding the minimum element
# from the unsorted portion and placing it at the beginning.
#
# How it works, step by step:
#   1. First we validate and copy the array
#   2. For each position i, we assume a[i] is the minimum (min_idx = i)
#   3. The inner loop scans everything after i to find the actual minimum.
#      If a[j] < a[min_idx], we update min_idx to j
#   4. After the inner loop, if min_idx != i, we swap a[i] with a[min_idx]
#      — this puts the smallest remaining element in its correct position
#
# Why this is "mid": Still O(n^2) comparisons like bubble sort, but it does
# at most n swaps (one per outer iteration). This matters when swaps are
# expensive (e.g., moving large objects). Think of it like finding the
# shortest person in a crowd and moving them to the front, then finding the
# next shortest, and so on.
#
# Interview tip: "Say this in the interview: 'Selection sort is still O(n^2)
# but does fewer swaps than bubble sort — at most one swap per position.
# For O(n log n), I'd use merge sort.'"
#
# Complexity: O(n^2) time, O(n) space (for the copy).
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


# ── BEST: Merge Sort ──
# What it does: Sorts an array using the divide-and-conquer strategy — split
# the array in half, sort each half recursively, then merge the sorted halves.
#
# How it works, step by step:
#   1. Base case: if the array has 0 or 1 elements, it's already sorted —
#      return a copy with arr[:]
#   2. We split at the midpoint: mid = len(arr) // 2, then recursively sort
#      the left half (arr[:mid]) and right half (arr[mid:])
#   3. The merge step uses two pointers (i for left, j for right). We compare
#      left[i] and right[j], appending the smaller one to merged. The <= in
#      "left[i] <= right[j]" makes this a stable sort (equal elements keep
#      their original order)
#   4. After one side is exhausted, merged.extend() appends any remaining
#      elements from the other side
#
# Why this is "best": O(n log n) time guaranteed — no worst-case degradation
# like quicksort. The "log n" comes from the splitting (each split halves the
# problem), and the "n" comes from the merge step at each level. Think of it
# like sorting a deck of cards by splitting it in half, sorting each half,
# then interleaving them back together.
#
# Interview tip: "Say this in the interview: 'Merge sort guarantees O(n log n)
# in all cases and is stable. The trade-off is O(n) extra space for the
# merged arrays.'"
#
# Complexity: O(n log n) time, O(n) space (for temporary merged arrays).
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


# ── WORST: Simple @ and . Check ──
# What it does: Validates an email address by only checking if it contains
# an "@" symbol and a dot — the bare minimum, which accepts many invalid
# emails.
#
# How it works, step by step:
#   1. First we check for None to avoid a crash on the "in" operator
#   2. We check "@" in email and "." in email — both must be present
#   3. That's it. No check for order (dot after @), no check for valid
#      characters, no check for empty local/domain parts
#
# Why this is "worst": This accepts clearly invalid emails like "@.", ".@",
# "@@...", or "spaces are fine@here.too". It's like checking if someone's
# address has a street number and a city name — without checking if they're
# in the right order or even real places.
#
# Interview tip: "Say this in the interview: 'Just checking for @ and .
# is insufficient — it accepts strings like "@." which are clearly not
# emails. I'd use structural validation or a regex pattern.'"
#
# Complexity: O(n) time, O(1) space.
def validate_email_worst(email: str) -> bool:
    if email is None:
        return False
    return "@" in email and "." in email


# ── MID: Manual Structural Validation ──
# What it does: Validates an email by manually checking its structure —
# exactly one @, non-empty local and domain parts, domain has at least
# two dot-separated parts, and reasonable length limits.
#
# How it works, step by step:
#   1. isinstance() check handles None and non-string inputs gracefully
#   2. We strip whitespace and reject empty or overly long (>254 char) strings
#   3. find("@") locates the @ symbol; at_idx < 1 rejects missing @ or @
#      at the start (no local part). count("@") > 1 rejects double-@
#   4. We split into local (before @) and domain (after @), checking local
#      isn't empty and doesn't exceed 64 chars (per RFC 5321)
#   5. We split the domain on "." and verify: at least 2 parts (e.g.,
#      "example.com"), no empty parts (rejects "example..com"), and the
#      last part (TLD) is at least 2 chars (rejects "user@example.c")
#
# Why this is "mid": Much better than just checking for @ and dot — it
# catches most invalid formats. But it doesn't validate allowed characters
# (e.g., it would accept "user name@example.com" with a space in the local
# part). Manual validation is also verbose and easy to get wrong.
#
# Interview tip: "Say this in the interview: 'Manual structural checks catch
# most format issues, but a regex can validate allowed characters and structure
# in one shot.'"
#
# Complexity: O(n) time, O(n) space (for split strings).
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


# ── BEST: Regex Approach ──
# What it does: Validates an email using a regex pattern inspired by RFC 5322,
# combined with basic length checks.
#
# How it works, step by step:
#   1. isinstance() and length checks handle edge cases first
#   2. The regex pattern breaks down as:
#      - ^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+ — local part: one or more valid
#        characters (letters, digits, and special chars allowed by the RFC)
#      - @ — literal @ separator
#      - [a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])? — domain label: starts
#        and ends with alphanumeric, up to 63 chars, hyphens allowed in the middle
#      - (?:\.[a-zA-Z0-9](...))* — zero or more additional domain labels
#      - \.[a-zA-Z]{2,}$ — TLD must be at least 2 letters (e.g., .com, .io)
#   3. re.match() checks if the entire string matches from the start; the $
#      anchor ensures nothing extra follows
#
# Why this is "best": A single regex validates both structure AND allowed
# characters simultaneously. It handles edge cases that the manual approach
# misses (like invalid characters in the local part). It's also the approach
# most real-world libraries use under the hood.
#
# Interview tip: "Say this in the interview: 'I use a simplified RFC 5322
# regex that validates structure and character sets in one pass. For
# production, I'd also consider a library like email-validator.'"
#
# Complexity: O(n) time, O(1) space.
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


# ── WORST: Naive Split ──
# What it does: Parses a log string and counts how many times each log level
# (ERROR, INFO, WARN, etc.) appears — using a simple split approach with
# no error handling.
#
# How it works, step by step:
#   1. We split the log into lines with log.split("\n")
#   2. For each line, we split on whitespace with line.split() and check
#      if there are at least 3 parts (date, time, level, message...)
#   3. We assume parts[2] is always the log level and count it in a dict
#      using counts.get(level, 0) + 1
#
# Why this is "worst": No validation at all. A malformed line like
# "MALFORMED LINE WITHOUT PROPER FORMAT" has 5 words, so parts[2] would
# be "WITHOUT" — and that gets counted as a log level. No error tracking,
# no malformed line detection. It's like reading a messy spreadsheet by
# always grabbing the third column without checking if the row makes sense.
#
# Interview tip: "Say this in the interview: 'Naive splitting is fragile —
# it assumes every line has the same structure. A regex pattern with named
# groups would let me validate format and extract data safely.'"
#
# Complexity: O(n) time, O(k) space where k is the number of unique levels.
def parse_log_worst(log: str) -> dict:
    counts = {}
    for line in log.split("\n"):
        parts = line.split()
        if len(parts) >= 3:
            level = parts[2]
            counts[level] = counts.get(level, 0) + 1
    return counts


# ── MID: Regex with Malformed Handling ──
# What it does: Parses log lines using a regex pattern that validates the
# expected format, separates malformed lines, and collects error messages.
#
# How it works, step by step:
#   1. We compile a regex pattern that expects: date (YYYY-MM-DD), space,
#      time (HH:MM:SS), whitespace, a valid level (ERROR|WARN|INFO|DEBUG),
#      whitespace, and the message. re.compile() pre-compiles the pattern
#      for efficiency when used in a loop
#   2. For each line, we try pattern.match(). If it fails and the line isn't
#      blank, we add it to the malformed list
#   3. If the match succeeds, we extract groups using match.groups() with
#      tuple unpacking: _, _, level, message (underscores ignore date/time)
#   4. We count levels and separately collect ERROR messages for quick access
#
# Why this is "mid": Much better than naive splitting — malformed lines are
# caught and reported, error messages are collected. But it doesn't track
# timestamps, doesn't aggregate error frequencies, and doesn't provide
# summary statistics.
#
# Interview tip: "Say this in the interview: 'Regex validation ensures only
# properly formatted lines are processed, and I track malformed lines
# separately for debugging.'"
#
# Complexity: O(n) time, O(n) space.
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


# ── BEST: Full Structured Parsing ──
# What it does: Parses a log string into a rich summary: level counts, top
# error messages ranked by frequency, time range, malformed lines, and
# line count statistics.
#
# How it works, step by step:
#   1. We guard against non-string input, returning a complete empty-structure
#      dict so callers can safely access any key without KeyError
#   2. The regex captures timestamp (date+time as one group), level, and
#      message. The pattern is compiled once for loop efficiency
#   3. We filter blank lines upfront with a list comprehension:
#      [l for l in log.split("\n") if l.strip()]
#   4. For each line, we try matching. Failures go to malformed. Successes
#      update: level counts, earliest/latest timestamps (simple string
#      comparison works for ISO-format dates), and error message frequencies
#   5. Finally, we sort error_messages by count (key=lambda x: -x[1] sorts
#      descending) and build a list of {message, count} dicts for the output
#   6. The return dict includes total_lines and valid_lines for a quick
#      data quality check
#
# Why this is "best": This is production-quality parsing — it handles bad
# input gracefully, provides actionable data (top errors, time range), and
# returns a consistent structure even for edge cases. Like a proper log
# analysis dashboard vs. just counting lines.
#
# Interview tip: "Say this in the interview: 'I return a consistent structure
# with error aggregation, time range, and data quality metrics — this is
# the kind of output that feeds directly into monitoring dashboards.'"
#
# Complexity: O(n) time, O(n) space.
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
