# Part 1: String Manipulation and Algorithm Basics

## The Coding Problems Every QA Automation Engineer Must Know

You are about to walk into a QA Automation Engineer interview. You have studied Selenium, memorized the difference between implicit and explicit waits, and can explain the Page Object Model in your sleep. Then the interviewer opens a shared code editor and says: "Let us start with a coding exercise."

This is where many QA candidates freeze. Not because the problems are impossibly hard --- they are typically between LeetCode Easy and Medium --- but because they did not expect to code in a QA interview, or they prepared the wrong problems.

This three-part series covers the 12 most commonly asked live coding exercises in QA Automation and SDET interviews. Part 1 focuses on string manipulation and algorithm basics --- the problems that appear most frequently across every source we surveyed.

---

## How QA Coding Interviews Differ from SWE Interviews

Before diving in, understand this: QA automation coding interviews are evaluated differently than software engineering interviews. Three things are assessed simultaneously:

- **Basic coding competence** --- Can you write clean, functional code?
- **Edge case awareness** --- Do you instinctively think about null inputs, empty strings, and boundary values?
- **Testing mindset** --- After writing a function, do you immediately think about how to break it?

Multiple SDET interview guides emphasize that "most interviewers watch out for your approach to solving problems, not the solution itself." The difficulty level is deliberately kept lower than SWE interviews. The evaluation focus shifts toward how thoroughly you consider failure modes and unexpected inputs.

This means that identifying three edge cases that would break a naive solution --- even if your code is not perfectly optimized --- signals exactly the kind of thinking QA teams need.

---

## String Manipulation Problems

String manipulation is the single most common category in QA automation coding interviews. QA engineers work with string data constantly: parsing logs, validating UI text, handling API responses, and writing assertions. These problems test that foundational skill.

### Problem 1: Palindrome Checking

**The problem:** Given a string, determine whether it is a palindrome --- a word or phrase that reads the same forwards and backwards.

**Common variations:**
- Ignore case sensitivity
- Ignore non-alphanumeric characters (spaces, punctuation)
- Check if a number is a palindrome
- Find the longest palindromic substring

**Why it appears in QA interviews:** This is the single most frequently cited coding problem across every QA interview resource we surveyed. Companies including Adobe, Apple, Meta, Goldman Sachs, Oracle, and Walmart Labs have reported asking this in QA engineer rounds according to Exponent's interview database. It tests string traversal, comparison logic, and --- critically --- edge case handling.

**What interviewers evaluate:**
- Do you ask clarifying questions before coding? ("Should I ignore spaces? What about punctuation? Is the comparison case-sensitive?")
- Do you identify edge cases before writing code? (Empty string, single character, string with only spaces, null input)
- Is your solution clean and readable?
- After finishing, do you walk through test cases?

**Edge cases to identify:**
- Empty string --- should return true (an empty string is trivially a palindrome)
- Single character --- should return true
- String with only spaces
- Mixed case ("Racecar" vs "racecar")
- String with special characters ("A man, a plan, a canal: Panama")
- Null/None input
- Very long strings (performance consideration)

**The QA differentiator:** A developer might write a correct palindrome checker and stop. A QA candidate should say: "If I were testing this function, I would verify it handles these cases..." and walk through at least 3--4 edge cases. That instinct is what interviewers are looking for.

---

### Problem 2: String Reversal

**The problem:** Reverse a given string without using built-in reverse functions.

**Common variations:**
- Reverse words in a sentence (keep word order reversed, not character order)
- Reverse only a portion of the string
- Reverse using recursion instead of iteration

**Why it appears in QA interviews:** This tests fundamental string indexing, loop construction, and character manipulation. The "without built-in functions" constraint is key --- it reveals whether candidates understand what happens under the hood. QA engineers who rely entirely on library functions without understanding the mechanics will struggle when those functions behave unexpectedly in edge cases.

**What interviewers evaluate:**
- Loop construction (using two pointers from start and end, swapping inward)
- Proper index handling (off-by-one errors are the classic failure)
- Whether the candidate converts to a character array first or manipulates the string directly
- Edge case awareness

**Edge cases to identify:**
- Empty string
- Single character string
- String with Unicode or multi-byte characters
- String with leading/trailing spaces
- Null/None input
- String containing only whitespace

---

### Problem 3: Anagram Detection

**The problem:** Given two strings, determine if they are anagrams (contain the same characters in different order). "listen" and "silent" are anagrams.

**Common variations:**
- Group an array of strings into anagram clusters
- Find all anagrams of a word in a larger string
- Case-insensitive anagram comparison

**Why it appears in QA interviews:** Anagram detection tests HashMap/dictionary usage and character counting --- operations that map directly to test data comparison. QA engineers frequently need to verify that data transformations preserve content, that sorting operations maintain all elements, and that no data is lost during processing.

**What interviewers evaluate:**
- Approach selection: sorting both strings and comparing (O(n log n), simpler) versus character frequency map (O(n), more efficient)
- Correct HashMap/dictionary usage
- Handling of edge cases in comparison logic

**Edge cases to identify:**
- Strings of different lengths (quick false return)
- Case sensitivity ("Listen" vs "silent")
- Strings containing spaces ("dormitory" vs "dirty room")
- Special characters
- Empty strings (two empty strings --- are they anagrams?)
- Null inputs

---

### Problem 4: Duplicate Character Detection and Counting

**The problem:** Given a string, find all duplicate characters and their frequency. Variations include: removing all duplicates, finding the first non-repeating character, counting non-space characters, or finding the longest substring without repeating characters.

**Why it appears in QA interviews:** This is one of the most frequently reported problems in QA/SDET compilations from AutomationReinvented, TechBeamers, and multiple Medium practitioner articles. The HashMap approach (character as key, count as value) is considered essential knowledge for automation testers. It maps directly to tasks like counting error types in logs, identifying repeated entries in test data, and validating data uniqueness constraints.

**What interviewers evaluate:**
- Proper HashMap/dictionary construction and iteration
- Clean output formatting
- Whether the candidate considers case sensitivity
- Handling of special characters and spaces

**Edge cases to identify:**
- Empty string
- String with no duplicates
- String with all identical characters
- String with spaces (should spaces be counted?)
- Case handling ("A" and "a" --- same or different?)
- Unicode characters
- Null input

---

## Algorithm Basics

These three problems test "can you actually program?" They are not algorithmically complex, but they appear in QA interviews because they test conditional logic, loop construction, and mathematical thinking --- all fundamental to writing automation scripts.

### Problem 5: FizzBuzz

**The problem:** Print numbers from 1 to N. For multiples of 3, print "Fizz." For multiples of 5, print "Buzz." For multiples of both 3 and 5, print "FizzBuzz."

**Why it appears in QA interviews:** FizzBuzz is the baseline coding problem --- the minimum bar. It tests conditional logic order (the "both 3 and 5" check must come before the individual checks), loop construction, and modulo operations. These are the same skills used in writing conditional test assertions, loop-based test data generation, and parameterized test logic.

**What interviewers evaluate:**
- Correct condition ordering (this is the most common failure --- checking for 3 and 5 separately before checking for both)
- Clean loop structure
- Whether the candidate naturally considers additional test scenarios

**Edge cases to identify:**
- N = 0 (should print nothing)
- N = 1 (only "1")
- N = 15 (first FizzBuzz)
- Negative N (what should happen?)
- Very large N (performance)
- N = 3, N = 5 (single Fizz, single Buzz)

**The QA differentiator:** After coding FizzBuzz, a strong QA candidate says: "I would test this with 0, 1, 3, 5, 15, and a negative number to verify each condition branch." That sentence alone signals testing maturity.

---

### Problem 6: Two Sum

**The problem:** Given an array of integers and a target sum, find two numbers that add up to the target and return their indices.

**Common variations:**
- Return the numbers themselves instead of indices
- Find all pairs that sum to the target
- Find pairs from a specific range (e.g., -50 to 50)

**Why it appears in QA interviews:** Two Sum tests array manipulation and HashMap usage, which are foundational for test data management. The choice between brute force (O(n^2) nested loops) and optimized (O(n) HashMap lookup) reveals whether candidates think about efficiency --- relevant when automation scripts run against large datasets.

**What interviewers evaluate:**
- Awareness of the brute-force versus optimized approach
- Correct HashMap usage for the O(n) solution
- Clear explanation of the approach before coding
- Edge case handling

**Edge cases to identify:**
- Empty array
- Array with one element (no valid pair possible)
- No valid pair exists
- Multiple valid pairs (which to return?)
- Duplicate values in the array
- Target of zero
- Negative numbers in the array

---

### Problem 7: Fibonacci Sequence

**The problem:** Generate the first N Fibonacci numbers, or return the Nth Fibonacci number. The sequence: 0, 1, 1, 2, 3, 5, 8, 13...

**Why it appears in QA interviews:** Fibonacci tests the choice between recursive and iterative approaches, base case handling, and variable management. SDET interview compilations consistently include it alongside palindromes and prime number detection. It also serves as a gateway to discussing test design: how would you test a Fibonacci generator?

**What interviewers evaluate:**
- Choice between recursion (elegant but inefficient) and iteration (efficient, preferred in interviews)
- Correct base case handling (N = 0 returns 0, N = 1 returns 1)
- Variable management in the iterative approach
- Awareness of overflow issues with large N

**Edge cases to identify:**
- N = 0 (should return 0 or empty sequence)
- N = 1 (should return [0] or just 0)
- N = 2 (should return [0, 1])
- Negative N (invalid input handling)
- Very large N (integer overflow, stack overflow for recursive)

---

## What to Remember

Across all seven problems in Part 1, the consistent pattern is clear: QA automation interviews use coding exercises as a lens into your testing mindset. The problem is the vehicle. The destination is your ability to think about what could go wrong.

For every problem:
1. Ask clarifying questions before coding
2. Identify at least 3 edge cases out loud
3. Write clean, readable code (not clever code)
4. After finishing, propose test cases for your own function

In Part 2, we cover array operations and data transformation --- the second most common category in QA coding interviews.

---

*This is Part 1 of a 3-part series on QA Automation Engineer interview coding exercises. Continue to [Part 2: Array Operations and Data Transformation](post-02.md).*
