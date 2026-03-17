// ============================================================================
// QA AUTOMATION INTERVIEW - LIVE CODING SOLUTIONS (JavaScript)
// 12 Problems x 3 Approaches: Best | Mid | Worst
// All snippets are runnable as-is in Node.js
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 1: PALINDROME CHECKING
// ─────────────────────────────────────────────────────────────────────────────

// WORST – O(n) extra space, creates reversed copy
function isPalindromeWorst(str) {
  if (str == null) return false;
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === cleaned.split("").reverse().join("");
}

// MID – O(n) with explicit loop, still allocates cleaned string
function isPalindromeMid(str) {
  if (str == null) return false;
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (let i = 0; i < Math.floor(cleaned.length / 2); i++) {
    if (cleaned[i] !== cleaned[cleaned.length - 1 - i]) return false;
  }
  return true;
}

// BEST – O(1) extra space, two-pointer on original string, skips non-alnum
function isPalindromeBest(str) {
  if (str == null) return false;
  const isAlnum = (ch) => /[a-z0-9]/.test(ch);
  let left = 0;
  let right = str.length - 1;

  while (left < right) {
    const lo = str[left].toLowerCase();
    const hi = str[right].toLowerCase();
    if (!isAlnum(lo)) { left++; continue; }
    if (!isAlnum(hi)) { right--; continue; }
    if (lo !== hi) return false;
    left++;
    right--;
  }
  return true;
}

console.log("=== PROBLEM 1: Palindrome ===");
["racecar", "A man, a plan, a canal: Panama", "hello", "", "a", null].forEach((s) =>
  console.log(`  "${s}" => worst:${isPalindromeWorst(s)} mid:${isPalindromeMid(s)} best:${isPalindromeBest(s)}`)
);

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM 2: STRING REVERSAL (without built-in reverse)
// ─────────────────────────────────────────────────────────────────────────────

// WORST – string concatenation in loop (O(n^2) in naive engines)
function reverseStringWorst(str) {
  if (str == null) return "";
  let result = "";
  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}

// MID – array push + join
function reverseStringMid(str) {
  if (str == null) return "";
  const chars = [];
  for (let i = str.length - 1; i >= 0; i--) {
    chars.push(str[i]);
  }
  return chars.join("");
}

// BEST – in-place swap on array, O(n) time, O(n) space (unavoidable for strings)
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

// WORST – sort both strings and compare, O(n log n)
function isAnagramWorst(a, b) {
  if (a == null || b == null) return false;
  const clean = (s) => s.toLowerCase().replace(/\s/g, "").split("").sort().join("");
  return clean(a) === clean(b);
}

// MID – two frequency maps, then compare
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

// BEST – single frequency map, increment for a, decrement for b, check zeros. O(n) time, O(1) space (bounded alphabet)
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

// WORST – nested loop, O(n^2)
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

// MID – frequency map, then filter
function dupCharsMid(str) {
  if (str == null) return {};
  const freq = {};
  for (const ch of str.toLowerCase()) {
    if (ch === " ") continue;
    freq[ch] = (freq[ch] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(freq).filter(([, v]) => v > 1));
}

// BEST – single-pass with Map (preserves insertion order, cleaner API)
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

// WORST – multiple if/else with string concatenation, checks divisibility twice
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

// MID – string building avoids redundant modulo checks
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

// BEST – extensible mapping, O(n*k) where k = number of rules
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

// WORST – brute force nested loops, O(n^2)
function twoSumWorst(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return null;
}

// MID – sort + two pointers, O(n log n), loses original indices
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

// BEST – hash map, O(n) time, O(n) space
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

// WORST – naive recursion, O(2^n) time
function fibWorst(n) {
  if (n < 0) return [];
  if (n === 0) return [0];
  if (n === 1) return [0, 1];
  const seq = fibWorst(n - 1);
  seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
  return seq;
}

// MID – iterative with array, O(n) time, O(n) space
function fibMid(n) {
  if (n < 0) return [];
  const seq = [0, 1];
  for (let i = 2; i <= n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq.slice(0, n + 1);
}

// BEST – iterative with constant space (generates array at end), O(n) time
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

// WORST – nested loop check, O(n^2)
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

// MID – indexOf check, still O(n^2) but cleaner
function dedupeMid(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

// BEST – Set, O(n) time
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

// WORST – sort first, O(n log n) time, O(n) space
function secondLargestWorst(arr) {
  if (!Array.isArray(arr) || arr.length < 2) return null;
  const sorted = [...new Set(arr)].sort((a, b) => b - a);
  return sorted.length >= 2 ? sorted[1] : null;
}

// MID – two passes: find max, then find max excluding first max
function secondLargestMid(arr) {
  if (!Array.isArray(arr) || arr.length < 2) return null;
  let max = -Infinity;
  for (const n of arr) { if (n > max) max = n; }
  let second = -Infinity;
  for (const n of arr) { if (n > second && n < max) second = n; }
  return second === -Infinity ? null : second;
}

// BEST – single pass tracking top two distinct values, O(n) time, O(1) space
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

// WORST – bubble sort, O(n^2) time, O(1) space, stable
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

// MID – selection sort, O(n^2) time, fewer swaps than bubble
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

// BEST – merge sort, O(n log n) time, O(n) space, stable
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

// WORST – simple check for @ and dot, misses many invalid cases
function validateEmailWorst(email) {
  if (email == null) return false;
  return email.includes("@") && email.includes(".");
}

// MID – manual character-by-character validation
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

// BEST – regex per RFC 5322 simplified + structural checks
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

// WORST – split lines, naive parsing, no error handling
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

// MID – regex parsing with malformed line handling
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

// BEST – structured parsing, aggregation by level + message, time range, malformed handling
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
