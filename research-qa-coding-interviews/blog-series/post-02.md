# Part 2: Array Operations and Data Transformation

## Working With Collections --- The QA Engineer's Daily Reality

If string manipulation is the most common category in QA automation coding interviews, array operations are a close second. And there is a good reason: QA engineers spend much of their time working with collections of things. Collections of test results. Collections of web elements on a page. Collections of API response objects. Collections of log entries.

The three problems in this section test your ability to manipulate, search, and transform arrays --- skills that translate directly to writing effective test automation.

---

## Array Operation Problems

### Problem 8: Array Deduplication

**The problem:** Given an array, remove all duplicate elements and return only unique values.

**Common variations:**
- Sorted array: remove duplicates in-place without extra memory (LeetCode 26)
- Unsorted array: return unique values preserving original order
- Array of strings instead of integers
- Array of objects where "duplicate" is defined by a specific field

**Why it appears in QA interviews:** Deduplication is one of the most practically relevant problems for QA work. Automation engineers frequently need to clean test data, filter unique results from test runs, validate that database queries return no unexpected duplicates, and process element lists from web pages. The sorted-array variant appears on LeetCode as problem 26 ("Remove Duplicates from Sorted Array") and is commonly referenced in SDET preparation materials.

**What interviewers evaluate:**

For sorted arrays, the expected approach is the two-pointer technique. One pointer tracks the position of the last unique element; the other iterates through the array. Since the array is sorted, all duplicate occurrences are consecutive, so you only need to compare adjacent elements.

For unsorted arrays, the expected approach uses a Set or HashSet. Insert each element into the set, which automatically handles uniqueness, then convert back to an array.

Interviewers also evaluate whether you understand the tradeoff: the two-pointer approach uses O(1) extra space but only works on sorted data, while the Set approach works on any array but uses O(n) extra space.

**Edge cases to identify:**
- Empty array
- Array with one element
- Array where all elements are identical
- Array with no duplicates (already unique)
- Array containing null/None values
- Array with negative numbers
- Very large arrays (memory and performance)
- For the sorted variant: array that is not actually sorted (should you validate?)

**The QA angle:** After implementing deduplication, a strong candidate says: "In a real test scenario, I would also verify that the order of remaining elements is preserved, that the original array is not modified unexpectedly, and that the count of unique elements matches expectations." This kind of assertion-oriented thinking is what QA interviewers want to hear.

---

### Problem 9: Finding Maximum/Minimum and Second Largest

**The problem:** Find the maximum, minimum, or second-largest element in an array without using built-in sort functions.

**Common variations:**
- Find both the largest and second-largest in a single pass
- Find the kth largest element
- Find max and min simultaneously

**Why it appears in QA interviews:** This problem shows up frequently in QA/SDET compilations from sources like AutomationReinvented and TechBeamers. It maps directly to practical QA tasks: finding the slowest response time in a batch of API calls, identifying the most frequent error in a log, or determining the highest-priority test case. The "without built-in sort" constraint ensures the candidate understands traversal and comparison at a fundamental level.

**What interviewers evaluate:**
- Proper initialization of tracking variables (do you initialize max to the first element or to Integer.MIN_VALUE? Each choice has implications)
- Single-pass versus multi-pass approach
- Correct logic for updating the second-largest value (only when a new maximum is found, the old maximum becomes second-largest)
- Clean, readable implementation

**Edge cases to identify:**
- Empty array (what do you return? Throw an exception?)
- Array with one element (no second-largest exists)
- Array with all identical elements (second-largest does not exist, or equals the largest?)
- Array with negative numbers only
- Array with Integer.MAX_VALUE or Integer.MIN_VALUE present
- Null array input
- Array containing duplicates (is the second-largest the second-distinct value, or just the second position?)

**Clarifying question that impresses interviewers:** "When you say second-largest, do you mean the second-highest distinct value, or the second element if we sorted descending? For [5, 5, 3], would the answer be 5 or 3?" This kind of precision is what QA thinking looks like in practice.

---

### Problem 10: Array Sorting Without Built-In Methods

**The problem:** Sort an array of integers using a manual sorting algorithm. The two most commonly requested algorithms are bubble sort and selection sort.

**Why it appears in QA interviews:** Understanding how sorting works is essential for QA engineers who need to validate that sort functionality in applications works correctly. If you do not understand the mechanics of a sorting algorithm, you cannot effectively test whether an application's sort feature handles all cases properly. This problem also tests nested loop construction, swap operations, and algorithmic thinking.

**What interviewers evaluate:**
- Clear implementation of one standard algorithm (bubble sort or selection sort)
- Correct swap logic (the classic temp-variable swap or language-specific alternatives)
- Understanding of algorithm characteristics:
  - Bubble sort: stable (preserves order of equal elements), O(n^2) average, O(n) best case if optimized with early termination
  - Selection sort: not stable, O(n^2) always, but minimizes the number of swaps
- Whether the candidate can explain when one might be preferred over the other

**Edge cases to identify:**
- Already sorted array (is there early termination?)
- Reverse-sorted array (worst case for bubble sort)
- Array with all identical elements
- Array with one element
- Empty array
- Array with negative numbers
- Array with duplicates

**QA-specific follow-up that interviewers love to ask:** "If I gave you a function called sortArray(), how would you test it?" Expected answers should include:
- Sorted input (verify no unnecessary changes)
- Reverse-sorted input (worst-case scenario)
- Input with duplicates (verify stability if relevant)
- Empty input and single-element input
- Input with negative numbers and mixed positive/negative
- Very large input (performance validation)
- Input with null elements (error handling)

This follow-up is the real test. The coding exercise is just the setup.

---

## Data Transformation: The Emerging Category

While the three problems above are the traditional array operations asked in QA interviews, there is a growing trend toward data transformation problems that more closely mirror actual QA work. These problems sit at the intersection of array operations and practical QA skills.

### Common Data Transformation Scenarios

**Object/JSON transformation:** Given an array of objects (or a JSON structure), transform it into a different shape. For example, convert an array of user objects into a dictionary keyed by user ID, or flatten a nested JSON response into a flat structure.

**Collection operations using map, filter, and reduce:** Given a dataset, perform a series of transformations --- filter out invalid entries, transform the remaining entries, and aggregate the results. This tests functional programming concepts that QA engineers use when processing test results programmatically.

**Flattening nested structures:** Given a deeply nested array like `[1, [2, [3, [4]]]]`, flatten it to `[1, 2, 3, 4]`. This appears as LeetCode 2625 (Flatten Deeply Nested Array) and tests recursion or iterative stack-based approaches.

**Why these are growing in QA interviews:** Modern QA automation involves heavy interaction with APIs, JSON payloads, and complex data structures. Interviewers increasingly want to see that candidates can manipulate real-world data shapes, not just primitive arrays and strings.

**What interviewers evaluate in transformation problems:**
- Correct use of language-specific collection methods
- Handling of missing fields or null values in objects
- Type safety awareness
- Clean, readable transformation logic

---

## The Pattern Across Array Problems

Looking at Problems 8 through 10 together, a clear pattern emerges in what interviewers evaluate for QA roles:

| Dimension | What Developers Are Judged On | What QA Candidates Are Judged On |
|-----------|-------------------------------|----------------------------------|
| Solution correctness | Required | Required |
| Algorithmic efficiency | Heavily weighted | Moderately weighted |
| Edge case identification | Expected | Heavily weighted |
| Testing awareness | Rarely asked | Always evaluated |
| Code readability | Important | Important |
| Communication | Important | Heavily weighted |

The shift in emphasis is consistent: QA interviews accept a less optimal algorithm in exchange for more thorough edge case analysis and testing awareness. You do not need to implement quicksort to pass a QA interview. You need to implement bubble sort correctly and then explain exactly how you would test it.

---

## Preparation Tips for Array Problems

1. **Master the HashMap/Set pattern.** At least half of the array problems in QA interviews are solved most cleanly with a HashMap or Set. Know how to create them, iterate over them, and handle key collisions in your language of choice.

2. **Practice the two-pointer technique.** The two-pointer approach solves sorted-array deduplication, palindrome checking, and array reversal. It is the most versatile single technique for QA interview problems.

3. **Know one sorting algorithm cold.** Bubble sort is the safest choice --- it is the simplest, most commonly requested, and easiest to explain. If you can also explain selection sort, you have more than enough.

4. **Always start with edge cases.** Before writing a single line of code, list the edge cases on the whiteboard or in comments. This is the single most impactful habit for QA interviews. It shows testing maturity from the first moment.

5. **End with test cases.** After completing your solution, proactively list 3--5 test cases you would write if this were production code. This is what separates QA candidates from developer candidates.

In Part 3, we cover data validation, edge case exercises, and the practical QA-specific problems that are becoming increasingly common in modern interviews.

---

*This is Part 2 of a 3-part series on QA Automation Engineer interview coding exercises. See [Part 1: String Manipulation and Algorithm Basics](post-01.md) or continue to [Part 3: Data Validation, Edge Cases, and Practical QA Exercises](post-03.md).*
