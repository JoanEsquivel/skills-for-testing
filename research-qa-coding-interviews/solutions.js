// ============================================================================
// QA AUTOMATION INTERVIEW - LIVE CODING SOLUTIONS (JavaScript)
// 12 Problems x 3 Approaches: Best | Mid | Worst
// All snippets are runnable as-is in Node.js
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 1: PALINDROME CHECKING
// ─────────────────────────────────────────────────────────────────────────────

// ── WORST: Reversed Copy ──
// What it does: Checks if a string reads the same forwards and backwards
//   by creating a reversed version and comparing the two.
//
// How it works, step by step:
//   1. First we guard against null/undefined input (str == null catches both)
//   2. Then we clean the string: lowercase everything and strip out anything
//      that isn't a letter or digit using a regex. This lets "A man, a plan..."
//      become "amanaplanacanalpanama".
//   3. Finally we split the cleaned string into an array of characters,
//      reverse that array, join it back into a string, and compare it to
//      the original cleaned string.
//
// Why this is "worst": Think of it like photocopying a book just to read it
//   backwards. We create a whole new reversed string in memory (O(n) extra
//   space) when we could just compare characters in place. We also use
//   split('') because JS strings don't have a .reverse() method -- only
//   arrays do -- so we pay the cost of converting to an array and back.
//
// Interview tip: "Say this in the interview: This is the cleanest one-liner,
//   but it allocates an extra reversed copy -- I'd optimize with two pointers."
//
// Complexity: O(n) time, O(n) space.
function isPalindromeWorst(str) {
  if (str == null) return false;
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === cleaned.split("").reverse().join("");
}

// ── MID: Explicit Loop Comparison ──
// What it does: Checks for a palindrome by walking through the first half
//   of the cleaned string and comparing each character to its mirror on
//   the other side.
//
// How it works, step by step:
//   1. First we guard against null/undefined, then clean the string the
//      same way as the worst version (lowercase + strip non-alphanumeric).
//   2. Then we loop from index 0 up to the midpoint (Math.floor handles
//      odd-length strings -- the middle character doesn't need checking).
//   3. At each step we compare cleaned[i] with cleaned[length - 1 - i].
//      If any pair doesn't match, we immediately return false.
//
// Why this is "mid": It's like checking a book by reading page 1 and the
//   last page, then page 2 and second-to-last, etc. We avoid creating a
//   whole reversed copy, but we still allocate a cleaned string up front.
//   It only checks half the characters, which is a nice improvement.
//
// Interview tip: "Say this in the interview: I avoid the reversed copy by
//   comparing from both ends, cutting comparisons in half."
//
// Complexity: O(n) time, O(n) space (the cleaned string).
function isPalindromeMid(str) {
  if (str == null) return false;
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (let i = 0; i < Math.floor(cleaned.length / 2); i++) {
    if (cleaned[i] !== cleaned[cleaned.length - 1 - i]) return false;
  }
  return true;
}

// ── BEST: Two-Pointer on Original String ──
// What it does: Checks for a palindrome without ever creating a cleaned
//   copy of the string. It walks two pointers inward from both ends,
//   skipping non-alphanumeric characters on the fly.
//
// How it works, step by step:
//   1. First we define a helper isAlnum that uses a regex to test if a
//      character is a letter or digit -- we need this to skip spaces,
//      punctuation, etc.
//   2. We set a left pointer at index 0 and a right pointer at the last
//      index. Each iteration, we lowercase the characters at both pointers.
//   3. If the left character isn't alphanumeric, we skip it (left++).
//      Same for the right side (right--). If both are valid and they don't
//      match, we return false. Otherwise we move both pointers inward.
//
// Why this is "best": Imagine two people starting at opposite ends of a
//   hallway, each skipping over furniture (non-letters) and calling out
//   tiles as they go. No photocopier, no cleaning crew needed -- just two
//   walkers and O(1) extra memory.
//
// Interview tip: "Say this in the interview: Two pointers give us O(1) space
//   by working on the original string and skipping non-alphanumeric chars."
//
// Complexity: O(n) time, O(1) space.
// const stringUnderEvaluation = 'Never odd or even'
// const stringUnderEvaluation = 'Never, odd or. even'
// const stringUnderEvaluation = '12344321'
// const stringUnderEvaluation = null
const stringUnderEvaluation = 'House House'
console.log(isPalindrome(stringUnderEvaluation))

function isPalindrome(stringToEvaluate) {
  //1- Evaluate if the string is null, if so we return false inmediatly
  if (stringToEvaluate == null) return false

  //2- Create an evaluator of a character to avoid puntuctuation sings or something that is not a character or a number
  // Regex: [] -> any of these characters
  //        a-z -> Letters
  //        0-9 -> Numbers
  const isAlNum = (ch) => /[a-z0-9]/.test(ch)

  //3- Set two pointers for the string under stringUnderEvaluation, so we can start comparing them.

  let left = 0
  let right = stringUnderEvaluation.length - 1

  //4- We start comparing the pointers, if the comparison is true, we add or decrease our pointers to the next char comparison. 

  while (left < right) {
    // 5- Get the characters assigned to the pointers. Make sure you make them be lowercase to avoid false positives
    let lowPointer = stringToEvaluate[left].toLowerCase()
    let highPointer = stringToEvaluate[right].toLowerCase()

    // 6- Skip characters that are not numbers or letters
    if (!isAlNum(lowPointer)) { left++; continue; }
    if (!isAlNum(highPointer)) { right--; continue; }

    // 7- The main validation, if the characters are not equal, we should stop the loop and return false. 

    if (lowPointer !== highPointer) return false

    // 8- If everything looks good, it is just a matter of increase and decrease the pointers to compare all the characters. 

    right--;
    left++;


  }

  // 9- If we are out of the loop we just return true.
  return true;

}



console.log("=== PROBLEM 1: Palindrome ===");
["racecar", "A man, a plan, a canal: Panama", "hello", "", "a", null].forEach((s) =>
  console.log(`  "${s}" => worst:${isPalindromeWorst(s)} mid:${isPalindromeMid(s)} best:${isPalindromeBest(s)}`)
);

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 2: STRING REVERSAL (without built-in reverse)
// ─────────────────────────────────────────────────────────────────────────────

// ── WORST: String Concatenation in Loop ──
// What it does: Reverses a string by building a new string one character
//   at a time, reading the original from back to front.
//
// How it works, step by step:
//   1. First we handle null/undefined by returning an empty string.
//   2. We start with an empty result string and loop backwards from the
//      last character to the first.
//   3. On each iteration we use result += str[i] to append the character.
//
// Why this is "worst": In JavaScript, strings are immutable -- every time
//   you do result += char, the engine may create a brand-new string in
//   memory. It's like rewriting an entire letter just to add one word at
//   the end. For n characters, you could end up copying 1+2+3+...+n
//   characters total, making it O(n^2) in naive engines. Modern V8 is
//   smarter, but interviewers still consider this the worst pattern.
//
// Interview tip: "Say this in the interview: String concatenation in a loop
//   can be O(n^2) because strings are immutable in JS."
//
// Complexity: O(n^2) time (worst case), O(n) space.
function reverseStringWorst(str) {
  if (str == null) return "";
  let result = "";
  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}

// ── MID: Array Push + Join ──
// What it does: Reverses a string by pushing characters into an array
//   (back to front) and then joining them into a single string at the end.
//
// How it works, step by step:
//   1. First we guard against null/undefined.
//   2. We create an empty array and loop backwards through the string,
//      pushing each character into the array.
//   3. Finally we call chars.join("") which stitches all the characters
//      together in one shot -- much faster than repeated concatenation.
//
// Why this is "mid": Think of it like collecting Scrabble tiles into a
//   tray (the array) and then reading them off at the end, versus gluing
//   tiles onto a board one by one (string concat). Array.push is O(1)
//   amortized, and join builds the final string in a single pass, so
//   total work is O(n). It's better than concatenation, but we still
//   allocate an extra array we don't strictly need.
//
// Interview tip: "Say this in the interview: I avoid the O(n^2)
//   concatenation trap by collecting into an array and joining once."
//
// Complexity: O(n) time, O(n) space.
function reverseStringMid(str) {
  if (str == null) return "";
  const chars = [];
  for (let i = str.length - 1; i >= 0; i--) {
    chars.push(str[i]);
  }
  return chars.join("");
}

// ── BEST: In-Place Swap on Array ──
// What it does: Reverses a string by converting it to an array, swapping
//   characters from the outside in using two pointers, then joining back.
//
// How it works, step by step:
//   1. First we convert the string to an array with Array.from(str) --
//      this is needed because JS strings are immutable (you can't do
//      str[0] = 'x'), but array elements can be reassigned.
//   2. We use two pointers (left and right) starting at opposite ends.
//      We swap chars[left] and chars[right] using JS destructuring
//      [a, b] = [b, a], then move both pointers inward.
//   3. Finally we join the array back into a string.
//
// Why this is "best": Imagine a line of people -- instead of building a
//   new line in reverse order, you just tell the first and last person
//   to trade places, then the second and second-to-last, and so on.
//   The space is still O(n) because JS strings are immutable (we must
//   create an array copy), but the swap pattern is the most efficient
//   approach and shows strong algorithm knowledge.
//
// Interview tip: "Say this in the interview: I do an in-place swap on a
//   char array -- O(n) space is unavoidable in JS since strings are immutable."
//
// Complexity: O(n) time, O(n) space (unavoidable for immutable strings).
function reverseStringBest(str) {
  if (str == null) return "";
  const chars = Array.from(str);
  let left = 0;
  let right = chars.length - 1;
  while (left < right) {
    [chars[left], chars[right]] = [chars[right], chars[left]];
    left++;
    right--;
  }
  return chars.join("");
}

console.log("\n=== PROBLEM 2: String Reversal ===");
["hello", "abcdef", "", "a", null].forEach((s) =>
  console.log(`  "${s}" => worst:"${reverseStringWorst(s)}" mid:"${reverseStringMid(s)}" best:"${reverseStringBest(s)}"`)
);

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 3: ANAGRAM DETECTION
// ─────────────────────────────────────────────────────────────────────────────

// ── WORST: Sort and Compare ──
// What it does: Checks if two strings are anagrams (contain exactly the
//   same letters) by sorting both and comparing the sorted results.
//
// How it works, step by step:
//   1. First we guard against null/undefined inputs.
//   2. We define a clean helper that lowercases the string, strips spaces,
//      splits into a character array, sorts it alphabetically, and joins
//      it back. For example, "listen" becomes "eilnst".
//   3. If clean(a) === clean(b), the strings are anagrams.
//
// Why this is "worst": Sorting is like organizing two decks of cards
//   alphabetically just to see if they have the same cards. It works,
//   but sorting costs O(n log n) when we could do it in O(n) with
//   counting. We also split/join because JS has no sort method on strings.
//
// Interview tip: "Say this in the interview: Sorting works but is O(n log n)
//   -- I can do better with a frequency map in O(n)."
//
// Complexity: O(n log n) time, O(n) space.
function isAnagramWorst(a, b) {
  if (a == null || b == null) return false;
  const clean = (s) => s.toLowerCase().replace(/\s/g, "").split("").sort().join("");
  return clean(a) === clean(b);
}

// ── MID: Two Frequency Maps ──
// What it does: Checks if two strings are anagrams by counting how often
//   each character appears in both strings, then comparing the two counts.
//
// How it works, step by step:
//   1. First we guard against null/undefined inputs.
//   2. We define a freqMap helper that loops through a cleaned string and
//      builds an object where keys are characters and values are counts.
//      The expression (map[ch] || 0) + 1 handles the first occurrence
//      (when map[ch] is undefined, || 0 defaults it to zero).
//   3. We build mapA and mapB, check they have the same number of keys,
//      then use .every() to confirm every key in mapA has the same count
//      in mapB.
//
// Why this is "mid": Instead of sorting two decks of cards, we now just
//   count how many of each card we have in each deck and compare tallies.
//   This is O(n) time -- much better! But we build two separate maps,
//   using roughly double the memory we need. We can do it with just one.
//
// Interview tip: "Say this in the interview: Frequency maps give us O(n)
//   time, but I can optimize space by using a single map."
//
// Complexity: O(n) time, O(n) space (two maps).
function isAnagramMid(a, b) {
  if (a == null || b == null) return false;
  const freqMap = (s) => {
    const map = {};
    for (const ch of s.toLowerCase().replace(/\s/g, "")) {
      map[ch] = (map[ch] || 0) + 1;
    }
    return map;
  };
  const mapA = freqMap(a);
  const mapB = freqMap(b);
  const keysA = Object.keys(mapA);
  if (keysA.length !== Object.keys(mapB).length) return false;
  return keysA.every((k) => mapA[k] === mapB[k]);
}

// ── BEST: Single Frequency Map ──
// What it does: Checks if two strings are anagrams using just one
//   frequency map -- incrementing counts for the first string and
//   decrementing for the second.
//
// How it works, step by step:
//   1. First we clean both strings (lowercase, strip spaces) and do an
//      early exit if their lengths differ -- anagrams must have the same
//      number of characters.
//   2. We loop through cleanA and increment freq[ch] for each character.
//   3. Then we loop through cleanB and decrement freq[ch]. If any count
//      drops below zero (the ! check catches 0 or undefined), the second
//      string has a character the first doesn't, so we return false.
//
// Why this is "best": Imagine you have a pile of letter tiles. For each
//   letter in word A you add a tile to the pile; for each letter in word B
//   you remove one. If the pile is empty at the end, they're anagrams.
//   One map, one pass through each string, and the space is O(1) because
//   the alphabet is bounded (at most 36 keys for a-z and 0-9).
//
// Interview tip: "Say this in the interview: One map, increment then
//   decrement -- O(n) time and effectively O(1) space for a bounded alphabet."
//
// Complexity: O(n) time, O(1) space (bounded alphabet).
function isAnagramBest(a, b) {
  if (a == null || b == null) return false;
  const cleanA = a.toLowerCase().replace(/\s/g, "");
  const cleanB = b.toLowerCase().replace(/\s/g, "");
  if (cleanA.length !== cleanB.length) return false;

  const freq = {};
  for (const ch of cleanA) freq[ch] = (freq[ch] || 0) + 1;
  for (const ch of cleanB) {
    if (!freq[ch]) return false;
    freq[ch]--;
  }
  return true;
}

console.log("\n=== PROBLEM 3: Anagram Detection ===");
[["listen", "silent"], ["hello", "world"], ["Astronomer", "Moon starer"], ["", ""], [null, "a"]].forEach(([a, b]) =>
  console.log(`  "${a}" vs "${b}" => worst:${isAnagramWorst(a, b)} mid:${isAnagramMid(a, b)} best:${isAnagramBest(a, b)}`)
);

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 4: DUPLICATE CHARACTER DETECTION & COUNTING
// ─────────────────────────────────────────────────────────────────────────────

// ── WORST: Nested Loop ──
// What it does: Finds characters that appear more than once in a string
//   by comparing every character against every other character.
//
// How it works, step by step:
//   1. First we guard against null and initialize an empty result object.
//      We lowercase the string so 'A' and 'a' are treated as the same.
//   2. For each character (outer loop), we skip spaces, then count how
//      many times it appears by scanning the entire string (inner loop).
//   3. If the count is greater than 1, we store it in the result object.
//      Duplicate keys just overwrite with the same value, so no harm done.
//
// Why this is "worst": It's like a teacher calling each student's name
//   and then counting every student in the room with that name -- for
//   every single student. That's n * n comparisons (O(n^2)). We also
//   redundantly recount characters we've already seen.
//
// Interview tip: "Say this in the interview: The brute force works but is
//   O(n^2) -- I'd use a frequency map to get it down to O(n)."
//
// Complexity: O(n^2) time, O(n) space.
function dupCharsWorst(str) {
  if (str == null) return {};
  const result = {};
  const s = str.toLowerCase();
  for (let i = 0; i < s.length; i++) {
    if (s[i] === " ") continue;
    let count = 0;
    for (let j = 0; j < s.length; j++) {
      if (s[i] === s[j]) count++;
    }
    if (count > 1) result[s[i]] = count;
  }
  return result;
}

// ── MID: Frequency Map + Filter ──
// What it does: Counts character frequencies in one pass, then filters
//   to keep only characters that appeared more than once.
//
// How it works, step by step:
//   1. First we guard against null, then loop through the lowercased
//      string, skipping spaces and building a frequency object.
//   2. Object.entries(freq) converts {a: 1, r: 2, ...} into an array of
//      [key, value] pairs. We filter to keep only pairs where value > 1.
//   3. Object.fromEntries converts the filtered pairs back into an object.
//
// Why this is "mid": It's like making a tally chart in one pass (O(n)),
//   then circling the tallies greater than 1. Much better than the nested
//   loop! However, we use a plain object which doesn't guarantee insertion
//   order in all edge cases, and the filter + fromEntries creates extra
//   intermediate arrays.
//
// Interview tip: "Say this in the interview: One pass to count, one filter
//   to extract duplicates -- clean and O(n)."
//
// Complexity: O(n) time, O(n) space.
function dupCharsMid(str) {
  if (str == null) return {};
  const freq = {};
  for (const ch of str.toLowerCase()) {
    if (ch === " ") continue;
    freq[ch] = (freq[ch] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(freq).filter(([, v]) => v > 1));
}

// ── BEST: Map-Based Approach ──
// What it does: Uses a JavaScript Map to count character frequencies and
//   then extracts only the duplicates into a new Map.
//
// How it works, step by step:
//   1. First we guard against null, returning an empty Map (not an object,
//      to stay consistent with the Map-based return type).
//   2. We loop through the lowercased string, skipping spaces. We use
//      freq.set() and freq.get() -- Map's API is cleaner than bracket
//      notation on plain objects. (freq.get(ch) || 0) + 1 handles the
//      first-seen case.
//   3. We iterate over the frequency Map and copy entries with count > 1
//      into a result Map.
//
// Why this is "best": Map guarantees insertion order (unlike plain objects
//   in older JS engines), has a cleaner get/set API, and works with any
//   key type (not just strings). It also avoids the prototype chain issues
//   that plain objects can have. This shows the interviewer you understand
//   when to reach for Map vs. a plain object.
//
// Interview tip: "Say this in the interview: I use Map for guaranteed
//   insertion order and a cleaner API -- it's the idiomatic JS choice."
//
// Complexity: O(n) time, O(n) space.
function dupCharsBest(str) {
  if (str == null) return new Map();
  const freq = new Map();
  for (const ch of str.toLowerCase()) {
    if (ch === " ") continue;
    freq.set(ch, (freq.get(ch) || 0) + 1);
  }
  const result = new Map();
  for (const [ch, count] of freq) {
    if (count > 1) result.set(ch, count);
  }
  return result;
}

console.log("\n=== PROBLEM 4: Duplicate Characters ===");
["programming", "hello world", "", null].forEach((s) =>
  console.log(`  "${s}" => worst:`, dupCharsWorst(s), "mid:", dupCharsMid(s), "best:", Object.fromEntries(dupCharsBest(s) || []))
);

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 5: FIZZBUZZ
// ─────────────────────────────────────────────────────────────────────────────

// ── WORST: If/Else Chain ──
// What it does: Produces the classic FizzBuzz sequence from 1 to n using
//   a chain of if/else if statements.
//
// How it works, step by step:
//   1. We loop from 1 to n.
//   2. For each number, we first check if it's divisible by BOTH 3 and 5
//      (i % 3 === 0 && i % 5 === 0) and push "FizzBuzz".
//   3. Then we check divisibility by 3 alone ("Fizz") and 5 alone ("Buzz").
//      If none match, we push the number as a string.
//
// Why this is "worst": The code works perfectly fine, but notice that when
//   i is divisible by 15 (both 3 and 5), we check i % 3 and i % 5 in
//   the first condition AND would check them again in the else-if branches.
//   The bigger issue is extensibility: if the interviewer says "now add
//   Bazz for 7", you have to add multiple new branches (7, 21, 35, 105...).
//   It's like hardcoding every combo -- it doesn't scale.
//
// Interview tip: "Say this in the interview: This works but the if/else
//   chain doesn't scale -- I'd use string building or a rules array."
//
// Complexity: O(n) time, O(n) space.
function fizzBuzzWorst(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(String(i));
  }
  return result;
}

// ── MID: String Building ──
// What it does: Produces FizzBuzz by building up a string for each number
//   instead of using a big if/else chain.
//
// How it works, step by step:
//   1. We loop from 1 to n, starting with an empty string s for each number.
//   2. If i is divisible by 3, we append "Fizz" to s. If divisible by 5,
//      we append "Buzz". These are independent checks, not else-ifs, so
//      a number divisible by both 3 and 5 naturally gets "FizzBuzz".
//   3. We push s || String(i) -- the || operator means "if s is empty
//      (falsy), use the number instead."
//
// Why this is "mid": Think of it like filling in a label: you write "Fizz"
//   if divisible by 3, then write "Buzz" after it if divisible by 5. No
//   need for a special "both" case -- it composes naturally. This eliminates
//   redundant modulo checks. But the rules (3 and 5) are still hardcoded
//   in the function body.
//
// Interview tip: "Say this in the interview: String building eliminates the
//   special FizzBuzz case by letting Fizz and Buzz compose naturally."
//
// Complexity: O(n) time, O(n) space.
function fizzBuzzMid(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    let s = "";
    if (i % 3 === 0) s += "Fizz";
    if (i % 5 === 0) s += "Buzz";
    result.push(s || String(i));
  }
  return result;
}

// ── BEST: Extensible Rules ──
// What it does: Produces FizzBuzz using a configurable array of rules,
//   so you can easily add new divisor/word pairs without changing any logic.
//
// How it works, step by step:
//   1. The function accepts a rules parameter (default: [[3, "Fizz"],
//      [5, "Buzz"]]). Each rule is a [divisor, word] pair.
//   2. For each number, we use .reduce() to iterate over all rules.
//      If i is divisible by the rule's divisor, we append that word to
//      the accumulator string. Otherwise we leave it unchanged.
//   3. We push s || String(i), same as the mid approach.
//
// Why this is "best": Imagine a restaurant menu -- instead of hardcoding
//   "if customer wants burger, do X; if pizza, do Y", you have a list
//   of items and a general process for each. Want to add "Bazz for 7"?
//   Just pass [[3,"Fizz"],[5,"Buzz"],[7,"Bazz"]]. The function never
//   changes. This shows the interviewer you think about extensibility
//   and the Open/Closed Principle.
//
// Interview tip: "Say this in the interview: I make the rules data-driven
//   so adding new divisors requires zero code changes."
//
// Complexity: O(n * k) time where k = number of rules, O(n) space.
function fizzBuzzBest(n, rules = [[3, "Fizz"], [5, "Buzz"]]) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    const s = rules.reduce((acc, [div, word]) => (i % div === 0 ? acc + word : acc), "");
    result.push(s || String(i));
  }
  return result;
}

console.log("\n=== PROBLEM 5: FizzBuzz (1-20) ===");
console.log("  worst:", fizzBuzzWorst(20).join(", "));
console.log("  mid:  ", fizzBuzzMid(20).join(", "));
console.log("  best: ", fizzBuzzBest(20).join(", "));
console.log("  best (custom rules):", fizzBuzzBest(20, [[2, "Fizz"], [7, "Buzz"]]).join(", "));

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 6: TWO SUM
// ─────────────────────────────────────────────────────────────────────────────

// ── WORST: Brute Force ──
// What it does: Finds two numbers in an array that add up to a target
//   by trying every possible pair.
//
// How it works, step by step:
//   1. The outer loop picks the first number (index i).
//   2. The inner loop picks the second number (index j), starting at
//      i + 1 to avoid pairing a number with itself and to avoid
//      checking the same pair twice (e.g., [0,1] and [1,0]).
//   3. If nums[i] + nums[j] equals the target, we return their indices.
//      If no pair works, we return null.
//
// Why this is "worst": Imagine trying to find two puzzle pieces that fit
//   by picking up each piece and comparing it to every other piece.
//   With n pieces, that's roughly n^2/2 comparisons. For 1000 elements
//   that's ~500,000 checks. A hash map can do it in ~1,000.
//
// Interview tip: "Say this in the interview: Brute force is O(n^2) -- I'd
//   use a hash map to look up complements in O(1) per element."
//
// Complexity: O(n^2) time, O(1) space.
function twoSumWorst(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return null;
}

// ── MID: Sort + Two Pointers ──
// What it does: Finds two numbers that add up to a target by sorting the
//   array first, then using two pointers from both ends.
//
// How it works, step by step:
//   1. First we create an array of [value, originalIndex] pairs and sort
//      by value. We need to save original indices because sorting changes
//      the order.
//   2. We place a left pointer at the start (smallest) and a right pointer
//      at the end (largest). We compute their sum.
//   3. If the sum equals the target, we return the original indices. If
//      the sum is too small, we move left up (to increase the sum). If
//      too large, we move right down (to decrease it).
//
// Why this is "mid": It's like having two people walk toward each other
//   on a sorted number line -- efficient once sorted. But sorting costs
//   O(n log n) and we need the extra indexed array to preserve original
//   positions. The hash map approach skips sorting entirely.
//
// Interview tip: "Say this in the interview: Sort + two pointers is O(n log n)
//   and useful when the array is already sorted, but a hash map is O(n)."
//
// Complexity: O(n log n) time, O(n) space.
function twoSumMid(nums, target) {
  const indexed = nums.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  let left = 0;
  let right = indexed.length - 1;
  while (left < right) {
    const sum = indexed[left][0] + indexed[right][0];
    if (sum === target) return [indexed[left][1], indexed[right][1]];
    if (sum < target) left++;
    else right--;
  }
  return null;
}

// ── BEST: Hash Map ──
// What it does: Finds two numbers that add up to a target in a single
//   pass using a Map to remember numbers we've already seen.
//
// How it works, step by step:
//   1. We create an empty Map called "seen" that will store {number: index}.
//   2. For each number, we compute its complement (target - nums[i]).
//      If the complement is already in our Map, we've found our pair --
//      return both indices.
//   3. If not, we store the current number and its index in the Map so
//      future iterations can find it as a complement.
//
// Why this is "best": Think of it like a bulletin board at a dance.
//   Each person writes "I need a partner who is X tall" on the board.
//   When a new person arrives, they check the board -- if someone
//   already needs exactly their height, it's a match! One pass through
//   the crowd, O(1) lookup per person. Clean and fast.
//
// Interview tip: "Say this in the interview: I store each number's index
//   in a Map and look up its complement -- one pass, O(n) total."
//
// Complexity: O(n) time, O(n) space.
function twoSumBest(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
  return null;
}

console.log("\n=== PROBLEM 6: Two Sum ===");
const nums6 = [2, 7, 11, 15];
console.log(`  [${nums6}] target=9 => worst:${twoSumWorst(nums6, 9)} mid:${twoSumMid(nums6, 9)} best:${twoSumBest(nums6, 9)}`);
console.log(`  [${nums6}] target=99 => worst:${twoSumWorst(nums6, 99)} mid:${twoSumMid(nums6, 99)} best:${twoSumBest(nums6, 99)}`);
console.log(`  [] target=1 => worst:${twoSumWorst([], 1)} mid:${twoSumMid([], 1)} best:${twoSumBest([], 1)}`);

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 7: FIBONACCI SEQUENCE
// ─────────────────────────────────────────────────────────────────────────────

// ── WORST: Naive Recursion ──
// What it does: Generates the Fibonacci sequence up to index n using
//   recursion -- the function calls itself to build the sequence.
//
// How it works, step by step:
//   1. Base cases: n < 0 returns empty array, n === 0 returns [0],
//      n === 1 returns [0, 1].
//   2. For n >= 2, we recursively call fibWorst(n - 1) to get the
//      sequence up to the previous index.
//   3. Then we push the sum of the last two elements onto that sequence
//      and return it.
//
// Why this is "worst": Each call to fibWorst(n) makes one recursive call
//   to fibWorst(n-1), and that call makes one to fibWorst(n-2), and so on.
//   This creates a call stack n levels deep. While this particular
//   implementation is actually O(n) time (it only makes one recursive call
//   per level), the deep recursion risks a stack overflow for large n.
//   The label "worst" here is about the recursion overhead and stack risk
//   rather than exponential time (which you'd get with the classic fib(n-1)+fib(n-2) version).
//
// Interview tip: "Say this in the interview: Recursive Fibonacci risks
//   stack overflow and has function call overhead -- iterative is safer."
//
// Complexity: O(n) time, O(n) space (call stack + array).
function fibWorst(n) {
  if (n < 0) return [];
  if (n === 0) return [0];
  if (n === 1) return [0, 1];
  const seq = fibWorst(n - 1);
  seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
  return seq;
}

// ── MID: Iterative with Array ──
// What it does: Generates the Fibonacci sequence iteratively by building
//   up an array from index 0 to n.
//
// How it works, step by step:
//   1. We handle n < 0 (empty array), then seed the array with [0, 1].
//   2. Starting at index 2, we push seq[i-1] + seq[i-2] on each iteration.
//      This is a simple loop -- no recursion, no stack risk.
//   3. We use slice(0, n + 1) at the end to handle the edge case where
//      n is 0 or 1 (the seeded array always has two elements).
//
// Why this is "mid": Like writing down each Fibonacci number in a notebook
//   as you go -- simple, no recursion, very clear. The only downside is
//   that we keep the entire sequence in memory. If someone only needed
//   the nth number (not the whole sequence), we'd be wasting space.
//   But since we need to return the full sequence anyway, this is practical.
//
// Interview tip: "Say this in the interview: Iterative avoids stack overflow
//   and is the go-to approach for generating the full sequence."
//
// Complexity: O(n) time, O(n) space.
function fibMid(n) {
  if (n < 0) return [];
  const seq = [0, 1];
  for (let i = 2; i <= n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq.slice(0, n + 1);
}

// ── BEST: Iterative Constant Space ──
// What it does: Generates the Fibonacci sequence using only two variables
//   to track the computation, then builds the result array along the way.
//
// How it works, step by step:
//   1. We handle edge cases (n < 0 and n === 0), then seed result with
//      [0, 1] and set prev = 0, curr = 1.
//   2. On each iteration, we use JS destructuring [prev, curr] = [curr,
//      prev + curr] to advance the two variables without a temp variable.
//      prev becomes the old curr, and curr becomes the new sum.
//   3. We push curr into the result array on each step.
//
// Why this is "best": Imagine two runners in a relay -- at each step,
//   the back runner leapfrogs the front runner. You only need to track
//   two positions, not the entire race history. The computation itself
//   uses O(1) extra space. We still build the result array (O(n)), but
//   that's required by the problem. This pattern shows the interviewer
//   you understand space optimization.
//
// Interview tip: "Say this in the interview: I track just prev and curr --
//   O(1) working space, and I build the output array as I go."
//
// Complexity: O(n) time, O(n) space (for the output array; O(1) working space).
function fibBest(n) {
  if (n < 0) return [];
  if (n === 0) return [0];
  const result = [0, 1];
  let prev = 0;
  let curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
    result.push(curr);
  }
  return result;
}

console.log("\n=== PROBLEM 7: Fibonacci (first 10) ===");
console.log("  worst:", fibWorst(9));
console.log("  mid:  ", fibMid(9));
console.log("  best: ", fibBest(9));
console.log("  edge (n=0):", fibBest(0), " edge (n=-1):", fibBest(-1));

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 8: ARRAY DEDUPLICATION
// ─────────────────────────────────────────────────────────────────────────────

// ── WORST: Nested Loop ──
// What it does: Removes duplicate values from an array by checking each
//   element against a growing "result" array using a nested loop.
//
// How it works, step by step:
//   1. We guard against non-array inputs and create an empty result array.
//   2. For each element in the input, we loop through everything already
//      in result to see if it's a duplicate (found = true). If we find
//      a match, we break out early.
//   3. If the element wasn't found in result, we push it in.
//
// Why this is "worst": It's like checking a guest list by reading through
//   the entire list every time someone new arrives. As the list grows,
//   each check takes longer. For n elements, worst case is 1+2+3+...+n
//   comparisons = O(n^2). The Set approach does the same lookup in O(1).
//
// Interview tip: "Say this in the interview: Linear search in the result
//   array makes this O(n^2) -- Set gives O(1) lookups."
//
// Complexity: O(n^2) time, O(n) space.
function dedupeWorst(arr) {
  if (!Array.isArray(arr)) return [];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    let found = false;
    for (let j = 0; j < result.length; j++) {
      if (arr[i] === result[j]) { found = true; break; }
    }
    if (!found) result.push(arr[i]);
  }
  return result;
}

// ── MID: indexOf/filter ──
// What it does: Removes duplicates by keeping only the first occurrence
//   of each element using filter and indexOf.
//
// How it works, step by step:
//   1. We guard against non-array inputs.
//   2. arr.filter((item, index) => arr.indexOf(item) === index) keeps an
//      element only if its first occurrence (indexOf) matches the current
//      index. So the second "3" at index 5 is filtered out because
//      indexOf("3") returns the earlier index.
//   3. This is a one-liner -- clean and readable.
//
// Why this is "mid": The code is elegant, but indexOf scans the array
//   from the start each time, making it O(n) per call. With n elements,
//   that's O(n^2) total -- same as the nested loop, just hidden behind
//   a nice API. It's like a cleaner version of the same slow approach.
//   Still, interviewers appreciate the readability.
//
// Interview tip: "Say this in the interview: filter + indexOf is clean
//   but still O(n^2) under the hood -- Set is the O(n) solution."
//
// Complexity: O(n^2) time, O(n) space.
function dedupeMid(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

// ── BEST: Set ──
// What it does: Removes duplicates using JavaScript's built-in Set, which
//   automatically ignores duplicate values.
//
// How it works, step by step:
//   1. We guard against non-array inputs.
//   2. new Set(arr) creates a Set from the array -- Sets only store unique
//      values, so duplicates are dropped automatically.
//   3. The spread operator [...set] converts the Set back into an array.
//
// Why this is "best": It's like dropping marbles into a jar that magically
//   rejects any marble already inside -- the jar (Set) does the duplicate
//   checking for you in O(1) per insertion using a hash table internally.
//   Total: O(n) time. It's also the shortest and most idiomatic JS
//   solution. Every interviewer expects you to know this one.
//
// Interview tip: "Say this in the interview: [...new Set(arr)] is the
//   idiomatic one-liner -- O(n) time, O(n) space."
//
// Complexity: O(n) time, O(n) space.
function dedupeBest(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr)];
}

console.log("\n=== PROBLEM 8: Array Deduplication ===");
const arr8 = [1, 2, 3, 2, 4, 1, 5, 3];
console.log(`  [${arr8}] => worst:[${dedupeWorst(arr8)}] mid:[${dedupeMid(arr8)}] best:[${dedupeBest(arr8)}]`);
console.log(`  [] => best:[${dedupeBest([])}]`);
console.log(`  null => best:[${dedupeBest(null)}]`);

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 9: FIND MAX/MIN AND SECOND LARGEST
// ─────────────────────────────────────────────────────────────────────────────

// ── WORST: Sort First ──
// What it does: Finds the second largest value by sorting the array in
//   descending order and picking the element at index 1.
//
// How it works, step by step:
//   1. We guard against non-arrays and arrays with fewer than 2 elements.
//   2. [...new Set(arr)] removes duplicates first -- without this,
//      [5, 5, 5] would incorrectly return 5 as the "second" largest.
//   3. We sort in descending order using (a, b) => b - a, then return
//      sorted[1] if it exists.
//
// Why this is "worst": Sorting is like organizing an entire bookshelf
//   just to find the second-tallest book. You're doing O(n log n) work
//   when you only need to find two values. The Set also creates an extra
//   array copy. It works, but it's overkill for this problem.
//
// Interview tip: "Say this in the interview: Sorting works but is
//   O(n log n) -- I can find the second largest in one pass with O(n)."
//
// Complexity: O(n log n) time, O(n) space.
function secondLargestWorst(arr) {
  if (!Array.isArray(arr) || arr.length < 2) return null;
  const sorted = [...new Set(arr)].sort((a, b) => b - a);
  return sorted.length >= 2 ? sorted[1] : null;
}

// ── MID: Two Passes ──
// What it does: Finds the second largest by making two passes through the
//   array -- first to find the maximum, then to find the largest value
//   that is strictly less than the maximum.
//
// How it works, step by step:
//   1. We guard against non-arrays and short arrays.
//   2. First pass: loop through and track the maximum value.
//   3. Second pass: loop again, tracking the largest value that is
//      strictly less than max (n > second && n < max). This naturally
//      handles duplicates -- if all values are the same, second stays
//      at -Infinity and we return null.
//
// Why this is "mid": It's like scanning a classroom twice -- once to find
//   the tallest student, once to find the second tallest. Two passes is
//   O(2n) = O(n), which is optimal time complexity. But we can do it in
//   a single pass by tracking both values simultaneously.
//
// Interview tip: "Say this in the interview: Two passes is O(n) but I
//   can optimize to a single pass tracking both top values at once."
//
// Complexity: O(n) time, O(1) space.
function secondLargestMid(arr) {
  if (!Array.isArray(arr) || arr.length < 2) return null;
  let max = -Infinity;
  for (const n of arr) { if (n > max) max = n; }
  let second = -Infinity;
  for (const n of arr) { if (n > second && n < max) second = n; }
  return second === -Infinity ? null : second;
}

// ── BEST: Single Pass ──
// What it does: Finds the second largest value in a single pass by
//   maintaining two variables: the largest and second largest seen so far.
//
// How it works, step by step:
//   1. We initialize first and second to -Infinity (so any real number
//      will be larger).
//   2. For each number: if it's bigger than first, the old first becomes
//      second and n becomes the new first (like a leapfrog).
//   3. If n isn't bigger than first but IS bigger than second AND isn't
//      equal to first (to handle duplicates), it becomes the new second.
//   4. If second is still -Infinity at the end, there was no valid second
//      largest, so we return null.
//
// Why this is "best": Imagine a podium with two spots. As each contestant
//   arrives, you immediately know if they deserve gold or silver -- no
//   need to wait and sort everyone. One loop, two variables, done.
//
// Interview tip: "Say this in the interview: Single pass with two trackers
//   gives O(n) time and O(1) space -- the optimal solution."
//
// Complexity: O(n) time, O(1) space.
function secondLargestBest(arr) {
  if (!Array.isArray(arr) || arr.length < 2) return null;
  let first = -Infinity;
  let second = -Infinity;

  for (const n of arr) {
    if (n > first) {
      second = first;
      first = n;
    } else if (n > second && n !== first) {
      second = n;
    }
  }
  return second === -Infinity ? null : second;
}

console.log("\n=== PROBLEM 9: Second Largest ===");
[[3, 1, 4, 1, 5, 9, 2, 6], [5, 5, 5], [42], [], [1, 2], [-3, -1, -7]].forEach((a) =>
  console.log(`  [${a}] => worst:${secondLargestWorst(a)} mid:${secondLargestMid(a)} best:${secondLargestBest(a)}`)
);

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 10: ARRAY SORTING WITHOUT BUILT-INS
// ─────────────────────────────────────────────────────────────────────────────

// ── WORST: Bubble Sort ──
// What it does: Sorts an array by repeatedly "bubbling" the largest
//   unsorted element to the end through adjacent swaps.
//
// How it works, step by step:
//   1. We copy the array with [...arr] to avoid mutating the original.
//   2. Outer loop runs n-1 times. Inner loop compares adjacent elements
//      (a[j] and a[j+1]) and swaps them if they're in the wrong order.
//      The "- i" optimization skips the already-sorted tail.
//   3. After each outer iteration, the next-largest element has "bubbled"
//      to its correct position at the end.
//
// Why this is "worst": Think of sorting a hand of cards by only comparing
//   neighbors -- you keep passing through the hand, nudging cards one
//   position at a time. It takes many passes. With n elements, worst case
//   is n*(n-1)/2 comparisons. It IS stable (equal elements keep their
//   original order) and uses O(1) extra space, but the O(n^2) time makes
//   it impractical for large datasets.
//
// Interview tip: "Say this in the interview: Bubble sort is O(n^2) and
//   mostly a teaching tool -- I'd use merge sort for O(n log n)."
//
// Complexity: O(n^2) time, O(1) space (in-place on copy), stable.
function sortBubble(arr) {
  if (!Array.isArray(arr)) return [];
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
    }
  }
  return a;
}

// ── MID: Selection Sort ──
// What it does: Sorts an array by repeatedly finding the minimum element
//   in the unsorted portion and placing it at the front.
//
// How it works, step by step:
//   1. We copy the array to avoid mutating the original.
//   2. For each position i, the inner loop scans the rest of the array
//      to find the index of the smallest element (minIdx).
//   3. If minIdx isn't already at position i, we swap a[i] and a[minIdx].
//      This means selection sort does at most n swaps total (vs. up to
//      n^2 swaps for bubble sort).
//
// Why this is "mid": Imagine picking the shortest person in a line and
//   putting them first, then the next shortest, and so on. The scanning
//   is still O(n^2), but the number of actual swaps is O(n) -- which
//   matters when swaps are expensive (e.g., large records). It's a step
//   up from bubble sort in practice, but still not efficient enough for
//   large inputs.
//
// Interview tip: "Say this in the interview: Selection sort minimizes
//   swaps to O(n) but comparisons are still O(n^2) -- merge sort is better."
//
// Complexity: O(n^2) time, O(1) space (in-place on copy), not stable.
function sortSelection(arr) {
  if (!Array.isArray(arr)) return [];
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) [a[i], a[minIdx]] = [a[minIdx], a[i]];
  }
  return a;
}

// ── BEST: Merge Sort ──
// What it does: Sorts an array using the divide-and-conquer strategy --
//   split the array in half, sort each half recursively, then merge the
//   two sorted halves together.
//
// How it works, step by step:
//   1. Base case: arrays of length 0 or 1 are already sorted (return a copy).
//   2. We find the midpoint and recursively sort the left and right halves
//      using arr.slice(). Each recursive call keeps splitting until we
//      hit the base case.
//   3. The merge step uses two pointers (i for left, j for right). We
//      compare left[i] and right[j], pushing the smaller one into merged.
//      The <= ensures stability (equal elements keep original order).
//      After one side is exhausted, we append the remaining elements.
//
// Why this is "best": Think of sorting a deck of cards by splitting it
//   into smaller and smaller piles, then merging sorted piles back
//   together. Each merge is O(n) and there are log(n) levels of splitting,
//   giving O(n log n) total. It's stable and consistently fast (no worst-
//   case degradation like quicksort). The tradeoff is O(n) extra space.
//
// Interview tip: "Say this in the interview: Merge sort guarantees
//   O(n log n) in all cases and is stable -- the gold standard for sorting."
//
// Complexity: O(n log n) time, O(n) space, stable.
function sortMerge(arr) {
  if (!Array.isArray(arr)) return [];
  if (arr.length <= 1) return [...arr];

  const mid = Math.floor(arr.length / 2);
  const left = sortMerge(arr.slice(0, mid));
  const right = sortMerge(arr.slice(mid));

  const merged = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) merged.push(left[i++]);
    else merged.push(right[j++]);
  }
  while (i < left.length) merged.push(left[i++]);
  while (j < right.length) merged.push(right[j++]);
  return merged;
}

console.log("\n=== PROBLEM 10: Sorting ===");
const arr10 = [64, 34, 25, 12, 22, 11, 90];
console.log(`  [${arr10}]`);
console.log(`  bubble:    [${sortBubble(arr10)}]`);
console.log(`  selection: [${sortSelection(arr10)}]`);
console.log(`  merge:     [${sortMerge(arr10)}]`);
console.log(`  empty:     [${sortMerge([])}]`);
console.log(`  single:    [${sortMerge([1])}]`);

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 11: INPUT VALIDATION (Email)
// ─────────────────────────────────────────────────────────────────────────────

// ── WORST: Simple @ and . Check ──
// What it does: Validates an email by simply checking whether it contains
//   an "@" symbol and a "." somewhere in the string.
//
// How it works, step by step:
//   1. We guard against null/undefined.
//   2. We use .includes("@") and .includes(".") to check for the two
//      most basic email characters.
//   3. If both exist anywhere in the string, we return true.
//
// Why this is "worst": This is like checking if something is a car by
//   asking "does it have wheels and a steering wheel?" -- a shopping cart
//   with a steering wheel taped on would pass. Strings like "@." or
//   "@@....." or "no-at-sign.com" (wait, that one fails) would be
//   accepted. It doesn't check position, count, or structure at all.
//   It will accept tons of invalid emails.
//
// Interview tip: "Say this in the interview: includes('@') is way too
//   permissive -- I'd validate structure or use a regex."
//
// Complexity: O(n) time, O(1) space.
function validateEmailWorst(email) {
  if (email == null) return false;
  return email.includes("@") && email.includes(".");
}

// ── MID: Manual Structural Validation ──
// What it does: Validates an email by manually checking its structure
//   piece by piece -- ensuring exactly one @, valid local/domain parts,
//   and proper domain structure.
//
// How it works, step by step:
//   1. We check for null, non-string types, empty strings, and the RFC
//      max length of 254 characters. We trim whitespace first.
//   2. We find the @ symbol and verify: it exists (atIdx >= 1 means at
//      least one char before it), and there's only one (lastIndexOf
//      matches indexOf).
//   3. We split into local part (before @) and domain part (after @).
//      We check local length (max 64 per RFC), domain has at least one
//      dot (domainParts.length >= 2), no empty segments between dots,
//      and the TLD (last part) is at least 2 characters.
//
// Why this is "mid": It's like a bouncer checking IDs manually -- thorough
//   but verbose. Each check is a separate if-statement, making the code
//   long but very readable and debuggable. The downside is that it
//   doesn't validate which characters are allowed in the local part, so
//   "hello world@example.com" might still pass.
//
// Interview tip: "Say this in the interview: Manual validation is readable
//   and testable, but a well-crafted regex is more complete."
//
// Complexity: O(n) time, O(n) space.
function validateEmailMid(email) {
  if (email == null || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;

  const atIdx = trimmed.indexOf("@");
  if (atIdx < 1) return false;
  if (trimmed.lastIndexOf("@") !== atIdx) return false;

  const local = trimmed.slice(0, atIdx);
  const domain = trimmed.slice(atIdx + 1);

  if (local.length === 0 || local.length > 64) return false;
  if (domain.length === 0) return false;

  const domainParts = domain.split(".");
  if (domainParts.length < 2) return false;
  if (domainParts.some((p) => p.length === 0)) return false;
  if (domainParts[domainParts.length - 1].length < 2) return false;

  return true;
}

// ── BEST: Regex Approach ──
// What it does: Validates an email using a regex pattern based on a
//   simplified version of RFC 5322, plus basic structural checks.
//
// How it works, step by step:
//   1. We guard against null, non-strings, empty input, and max length.
//   2. The regex pattern validates the full email structure in one shot:
//      - Local part: [a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+ allows all
//        RFC-valid special characters.
//      - @ separates local and domain.
//      - Domain: [a-zA-Z0-9] segments separated by dots, each up to 63
//        chars, optionally containing hyphens (but not at start/end).
//      - TLD: [a-zA-Z]{2,} ensures the last segment is at least 2
//        letters (no "user@host.x").
//   3. pattern.test(trimmed) returns true/false.
//
// Why this is "best": A regex is like a blueprint that describes the exact
//   shape of a valid email. One line does what the manual approach needs
//   20 lines for, and it validates character sets too. The tradeoff is
//   readability -- long regexes can be intimidating. In an interview,
//   explain the pattern in plain English to show you understand it.
//
// Interview tip: "Say this in the interview: I use a simplified RFC 5322
//   regex with structural pre-checks for length and trimming."
//
// Complexity: O(n) time, O(1) space.
function validateEmailBest(email) {
  if (email == null || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return pattern.test(trimmed);
}

console.log("\n=== PROBLEM 11: Email Validation ===");
["user@example.com", "bad@", "@no.com", "double@@at.com", "spaces @x.com", "", null, "a@b.c", "valid+tag@gmail.com"].forEach((e) =>
  console.log(`  "${e}" => worst:${validateEmailWorst(e)} mid:${validateEmailMid(e)} best:${validateEmailBest(e)}`)
);

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 12: LOG FILE PARSING & DATA AGGREGATION
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_LOG = `2024-01-15 10:23:01 ERROR Database connection timeout
2024-01-15 10:23:05 INFO  Retrying connection
2024-01-15 10:23:10 ERROR Database connection timeout
2024-01-15 10:23:15 WARN  High memory usage detected
2024-01-15 10:24:00 INFO  Connection established
2024-01-15 10:25:30 ERROR File not found: /tmp/data.csv
2024-01-15 10:26:00 INFO  Request processed successfully
MALFORMED LINE WITHOUT PROPER FORMAT
2024-01-15 10:27:00 DEBUG Cache miss for key user:123`;

// ── WORST: Naive Split ──
// What it does: Parses a log file by splitting each line on spaces and
//   assuming the third word is always the log level.
//
// How it works, step by step:
//   1. We split the entire log string on newlines to get an array of lines.
//   2. For each line, we split on spaces and grab parts[2] as the level
//      (date is parts[0], time is parts[1], level is parts[2]).
//   3. We count occurrences of each level in a frequency object.
//
// Why this is "worst": It's like reading a form by always looking at the
//   third word -- if a line is malformed (e.g., "MALFORMED LINE WITHOUT
//   PROPER FORMAT"), parts[2] becomes a random word and gets counted as
//   a "level." There's no validation, no error handling, and no way to
//   extract messages. The malformed line here would count "WITHOUT" as
//   a log level.
//
// Interview tip: "Say this in the interview: Naive splitting breaks on
//   malformed input -- I'd use regex with validation for production code."
//
// Complexity: O(n) time, O(n) space.
function parseLogWorst(log) {
  const lines = log.split("\n");
  const counts = {};
  for (const line of lines) {
    const parts = line.split(" ");
    const level = parts[2];
    counts[level] = (counts[level] || 0) + 1;
  }
  return counts;
}

// ── MID: Regex with Malformed Handling ──
// What it does: Parses log lines using a regex pattern, separating valid
//   entries from malformed lines and collecting error messages.
//
// How it works, step by step:
//   1. We split on newlines and prepare three collectors: counts (level
//      frequencies), errors (ERROR messages), and malformed (bad lines).
//   2. Each line is tested against a regex that expects: date (YYYY-MM-DD),
//      space, time (HH:MM:SS), whitespace, a level (ERROR|WARN|INFO|DEBUG),
//      whitespace, and the message. The + after \s allows for the extra
//      space in "INFO " lines (where the level is padded).
//   3. If the regex doesn't match, the line goes into the malformed array.
//      Otherwise we destructure the capture groups and count the level.
//      ERROR messages are also collected separately.
//
// Why this is "mid": It's like a mail sorter that can identify misaddressed
//   letters and put them aside. Much better than naive splitting! But it
//   doesn't track time ranges, doesn't aggregate error messages by
//   frequency, and doesn't count total/valid lines.
//
// Interview tip: "Say this in the interview: Regex parsing with a malformed
//   fallback is production-ready -- I'd add time range tracking for the best version."
//
// Complexity: O(n) time, O(n) space.
function parseLogMid(log) {
  const lines = log.split("\n");
  const counts = {};
  const errors = [];
  const malformed = [];

  for (const line of lines) {
    const match = line.match(/^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})\s+(ERROR|WARN|INFO|DEBUG)\s+(.+)$/);
    if (!match) {
      malformed.push(line);
      continue;
    }
    const [, , , level, message] = match;
    counts[level] = (counts[level] || 0) + 1;
    if (level === "ERROR") errors.push(message);
  }
  return { counts, errors, malformed };
}

// ── BEST: Full Structured Parsing ──
// What it does: Parses a log file into a rich structured result with level
//   counts, top error messages ranked by frequency, time range, malformed
//   line tracking, and line count statistics.
//
// How it works, step by step:
//   1. We guard against null/non-string input with a safe default return.
//      We filter out blank lines so they don't count as malformed.
//   2. Each line is matched against a regex. The timestamp capture group
//      includes both date and time ("2024-01-15 10:23:01") so we can
//      track the earliest and latest timestamps using simple string
//      comparison (ISO format sorts lexicographically).
//   3. We count levels, track malformed lines, and also build an
//      errorMessages frequency map. After the loop, we sort error
//      messages by count (descending) and format them as objects with
//      {message, count} for easy consumption.
//   4. The return object includes counts, topErrors, timeRange,
//      malformed lines, totalLines, and validLines -- everything a
//      dashboard or monitoring tool would need.
//
// Why this is "best": It's like a full audit report vs. a quick tally.
//   You get actionable intelligence: "What errors happen most? When did
//   the log start and end? How many lines were unparseable?" This shows
//   the interviewer you think about real-world production needs.
//
// Interview tip: "Say this in the interview: I return structured data with
//   error ranking, time range, and malformed tracking -- production-grade parsing."
//
// Complexity: O(n) time, O(n) space.
function parseLogBest(log) {
  if (log == null || typeof log !== "string") return { counts: {}, topErrors: [], timeRange: null, malformed: [] };

  const lines = log.split("\n").filter((l) => l.trim().length > 0);
  const counts = {};
  const errorMessages = {};
  const malformed = [];
  let earliest = null;
  let latest = null;

  for (const line of lines) {
    const match = line.match(/^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s+(ERROR|WARN|INFO|DEBUG)\s+(.+)$/);
    if (!match) {
      malformed.push(line);
      continue;
    }
    const [, timestamp, level, message] = match;
    counts[level] = (counts[level] || 0) + 1;

    if (!earliest || timestamp < earliest) earliest = timestamp;
    if (!latest || timestamp > latest) latest = timestamp;

    if (level === "ERROR") {
      errorMessages[message] = (errorMessages[message] || 0) + 1;
    }
  }

  const topErrors = Object.entries(errorMessages)
    .sort((a, b) => b[1] - a[1])
    .map(([msg, count]) => ({ message: msg, count }));

  return {
    counts,
    topErrors,
    timeRange: earliest ? { from: earliest, to: latest } : null,
    malformed,
    totalLines: lines.length,
    validLines: lines.length - malformed.length,
  };
}

console.log("\n=== PROBLEM 12: Log Parsing ===");
console.log("  worst:", parseLogWorst(SAMPLE_LOG));
console.log("  mid:  ", JSON.stringify(parseLogMid(SAMPLE_LOG), null, 2));
console.log("  best: ", JSON.stringify(parseLogBest(SAMPLE_LOG), null, 2));
