import {
  CODING_CPP_SOLUTIONS,
  CODING_JAVA_SOLUTIONS,
  CODING_JAVASCRIPT_SOLUTIONS,
} from "./coding-solutions-multilang";

export type CodingSolutionLanguage = "python" | "javascript" | "java" | "cpp";

const SOLUTION_MAPS: Record<CodingSolutionLanguage, Record<string, string>> = {
  python: {} as Record<string, string>,
  javascript: CODING_JAVASCRIPT_SOLUTIONS,
  java: CODING_JAVA_SOLUTIONS,
  cpp: CODING_CPP_SOLUTIONS,
};

const LANGUAGE_LABELS: Record<CodingSolutionLanguage, string> = {
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  cpp: "C++",
};

/** Progressive hints — nudge without giving away the full approach. */
export const CODING_HINTS: Record<string, string> = {
  "two-sum":
    "As you scan the array, ask: have you already seen the number that would complete the pair (target − current)?",
  "valid-parentheses":
    "What happens when you see an opening bracket vs a closing one? Which structure is LIFO?",
  "best-time-to-buy-sell-stock":
    "You only need the best buy price seen so far and the best profit so far — one pass is enough.",
  "contains-duplicate":
    "If you could check whether you've seen a value in O(1), would that help?",
  "valid-anagram": "Two strings are anagrams if they have the same character counts.",
  "maximum-subarray": "At each index, decide: extend the current subarray or start fresh?",
  "climbing-stairs": "How many ways to reach step n if you can only take 1 or 2 steps at a time?",
  "move-zeroes": "Can you fill non-zeros from the front without losing order?",
  "reverse-string": "Two pointers from opposite ends — what do you swap?",
  "palindrome-number": "Compare digits from both ends, or reverse half the number.",
  "roman-to-integer":
    "Usually add values left-to-right, but subtract when a smaller numeral precedes a larger one.",
  "single-number": "XOR cancels equal bits — useful when every number appears twice except one.",
  "missing-number": "Expected sum of 0..n minus actual sum, or XOR all indices and values.",
  "plus-one": "Start from the rightmost digit and propagate carry.",
  "happy-number": "If digit-square sums repeat, you're in a cycle.",
  "remove-duplicates": "Slow pointer marks where unique values should go.",
  "sqrt-x": "Binary search on the answer in range [0, x].",
  "merge-intervals": "Sort by start time, then merge if current overlaps the last merged interval.",
  "longest-substring": "Expand the window and track the last index you saw each character.",
  "product-except-self": "Prefix products from the left × suffix products from the right.",
  "container-with-most-water": "Two pointers at both ends — move the shorter line inward.",
  "three-sum": "Fix one number, then two-pointer scan for pairs that sum to its negation.",
  "coin-change": "DP: min coins to make amount a = 1 + min over each coin of dp[a − coin].",
  "house-robber": "At each house: rob it + best up to i−2, or skip and take best up to i−1.",
  "unique-paths": "Grid DP: paths to (i,j) = paths from above + paths from left.",
  "decode-ways": "DP over string prefix — handle single-digit and valid two-digit chunks.",
  "jump-game": "Track the farthest index reachable from any prior position.",
  "daily-temperatures": "Monotonic stack stores indices waiting for a warmer day.",
  "subarray-sum-equals-k": "Prefix sum + hash map counting how often each prefix has appeared.",
  "find-anagrams": "Fixed-size sliding window with matching character counts.",
  "rotate-array": "Reverse whole array, then reverse first k and last n−k elements.",
  "sort-colors": "Dutch national flag: three pointers for 0, 1, and 2 regions.",
  "search-rotated-array": "One half is always sorted — binary search on the sorted half.",
  "kth-largest": "Min-heap of size k, or quickselect on a partition.",
  "word-break": "DP: prefix breakable if some earlier split works and suffix is in the dictionary.",
  "spiral-matrix": "Shrink top/bottom/left/right boundaries as you traverse.",
  "longest-increasing-subsequence": "Patience sorting with binary search, or O(n²) DP.",
  "gas-station": "If total gas < total cost, impossible. Otherwise start where tank never goes negative.",
  "meeting-rooms-ii": "Sort start and end times; sweep with a min-heap of end times.",
  "binary-tree-level-order": "BFS with a queue, processing one level at a time.",
  "number-of-islands": "DFS or BFS every unseen '1' and mark visited.",
  "course-schedule": "Topological sort — detect cycle in prerequisite graph.",
  "word-ladder": "BFS from beginWord; try changing each letter to reach neighbors in wordList.",
  "trapping-rain-water": "Two pointers or prefix max arrays from both sides.",
  "sliding-window-maximum": "Deque storing indices in decreasing value order.",
  "edit-distance": "2D DP on prefixes of both strings — insert, delete, replace.",
  "regex-matching": "DP with '.' and '*' transitions on pattern index.",
  "largest-rectangle-histogram": "Monotonic stack — when popping, width extends to current index.",
  "min-window-substring": "Expand right until valid, then shrink left while still valid.",
  "merge-k-lists": "Min-heap of (value, list_index) from k list heads.",
  "serialize-tree": "Level-order BFS with explicit null markers for missing children.",
  "n-queens": "Backtrack row by row; track occupied columns and diagonals.",
};

/** Reference Python implementations shown in Official Solution. */
export const CODING_PYTHON_SOLUTIONS: Record<string, string> = {
  "two-sum": `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i`,

  "valid-parentheses": `def is_valid(s):
    stack = []
    match = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in match:
            if not stack or stack.pop() != match[c]:
                return False
        else:
            stack.append(c)
    return len(stack) == 0`,

  "best-time-to-buy-sell-stock": `def max_profit(prices):
    best, low = 0, prices[0]
    for p in prices[1:]:
        best = max(best, p - low)
        low = min(low, p)
    return best`,

  "contains-duplicate": `def contains_duplicate(nums):
    return len(nums) != len(set(nums))`,

  "valid-anagram": `def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        count[c] = count.get(c, 0) - 1
        if count[c] < 0:
            return False
    return True`,

  "maximum-subarray": `def max_subarray(nums):
    best = cur = nums[0]
    for n in nums[1:]:
        cur = max(n, cur + n)
        best = max(best, cur)
    return best`,

  "climbing-stairs": `def climb_stairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,

  "move-zeroes": `def move_zeroes(nums):
    j = 0
    for i in range(len(nums)):
        if nums[i] != 0:
            nums[j], nums[i] = nums[i], nums[j]
            j += 1`,

  "reverse-string": `def reverse_string(s):
    s = list(s)
    l, r = 0, len(s) - 1
    while l < r:
        s[l], s[r] = s[r], s[l]
        l += 1
        r -= 1
    return ''.join(s)`,

  "palindrome-number": `def is_palindrome(x):
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    rev = 0
    while x > rev:
        rev = rev * 10 + x % 10
        x //= 10
    return x == rev or x == rev // 10`,

  "roman-to-integer": `def roman_to_int(s):
    vals = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    total = 0
    for i, c in enumerate(s):
        if i + 1 < len(s) and vals[c] < vals[s[i + 1]]:
            total -= vals[c]
        else:
            total += vals[c]
    return total`,

  "single-number": `def single_number(nums):
    x = 0
    for n in nums:
        x ^= n
    return x`,

  "missing-number": `def missing_number(nums):
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)`,

  "plus-one": `def plus_one(digits):
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits
        digits[i] = 0
    return [1] + digits`,

  "happy-number": `def is_happy(n):
    seen = set()
    while n not in seen:
        seen.add(n)
        n = sum(int(d) ** 2 for d in str(n))
        if n == 1:
            return True
    return False`,

  "remove-duplicates": `def remove_duplicates(nums):
    if not nums:
        return 0
    j = 1
    for i in range(1, len(nums)):
        if nums[i] != nums[i - 1]:
            nums[j] = nums[i]
            j += 1
    return j`,

  "sqrt-x": `def my_sqrt(x):
    if x < 2:
        return x
    lo, hi = 2, x // 2
    while lo <= hi:
        mid = (lo + hi) // 2
        if mid * mid == x:
            return mid
        if mid * mid < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return hi`,

  "merge-intervals": `def merge_intervals(intervals):
    intervals.sort(key=lambda x: x[0])
    out = [intervals[0]]
    for s, e in intervals[1:]:
        if s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`,

  "longest-substring": `def length_of_longest_substring(s):
    last = {}
    start = best = 0
    for i, c in enumerate(s):
        if c in last and last[c] >= start:
            start = last[c] + 1
        last[c] = i
        best = max(best, i - start + 1)
    return best`,

  "product-except-self": `def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    p = 1
    for i in range(n):
        out[i] = p
        p *= nums[i]
    p = 1
    for i in range(n - 1, -1, -1):
        out[i] *= p
        p *= nums[i]
    return out`,

  "container-with-most-water": `def max_area(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        best = max(best, min(height[l], height[r]) * (r - l))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best`,

  "three-sum": `def three_sum(nums):
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if i and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s == 0:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
            elif s < 0:
                l += 1
            else:
                r -= 1
    return res`,

  "coin-change": `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,

  "house-robber": `def rob(nums):
    prev, cur = 0, 0
    for n in nums:
        prev, cur = cur, max(cur, prev + n)
    return cur`,

  "unique-paths": `def unique_paths(m, n):
    row = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            row[j] += row[j - 1]
    return row[-1]`,

  "decode-ways": `def num_decodings(s):
    if not s or s[0] == '0':
        return 0
    dp = [0] * (len(s) + 1)
    dp[0] = dp[1] = 1
    for i in range(2, len(s) + 1):
        if s[i - 1] != '0':
            dp[i] += dp[i - 1]
        if 10 <= int(s[i - 2:i]) <= 26:
            dp[i] += dp[i - 2]
    return dp[-1]`,

  "jump-game": `def can_jump(nums):
    reach = 0
    for i, n in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + n)
    return True`,

  "daily-temperatures": `def daily_temperatures(temps):
    res = [0] * len(temps)
    stack = []
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            res[j] = i - j
        stack.append(i)
    return res`,

  "subarray-sum-equals-k": `def subarray_sum(nums, k):
    count = 0
    prefix = 0
    freq = {0: 1}
    for n in nums:
        prefix += n
        count += freq.get(prefix - k, 0)
        freq[prefix] = freq.get(prefix, 0) + 1
    return count`,

  "find-anagrams": `def find_anagrams(s, p):
    from collections import Counter
    need, have = Counter(p), Counter()
    res, k = [], len(p)
    for i, c in enumerate(s):
        have[c] += 1
        if i >= k:
            left = s[i - k]
            have[left] -= 1
            if have[left] == 0:
                del have[left]
        if i >= k - 1 and have == need:
            res.append(i - k + 1)
    return res`,

  "rotate-array": `def rotate(nums, k):
    k %= len(nums)
    def rev(a, l, r):
        while l < r:
            a[l], a[r] = a[r], a[l]
            l += 1
            r -= 1
    rev(nums, 0, len(nums) - 1)
    rev(nums, 0, k - 1)
    rev(nums, k, len(nums) - 1)`,

  "sort-colors": `def sort_colors(nums):
    lo, mid, hi = 0, 0, len(nums) - 1
    while mid <= hi:
        if nums[mid] == 0:
            nums[lo], nums[mid] = nums[mid], nums[lo]
            lo += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[hi] = nums[hi], nums[mid]
            hi -= 1`,

  "search-rotated-array": `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,

  "kth-largest": `def find_kth_largest(nums, k):
    import heapq
    heap = nums[:k]
    heapq.heapify(heap)
    for n in nums[k:]:
        if n > heap[0]:
            heapq.heapreplace(heap, n)
    return heap[0]`,

  "word-break": `def word_break(s, wordDict):
    words = set(wordDict)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return dp[-1]`,

  "spiral-matrix": `def spiral_order(matrix):
    res = []
    while matrix:
        res += matrix.pop(0)
        if matrix and matrix[0]:
            for row in matrix:
                res.append(row.pop())
        if matrix:
            res += matrix.pop()[::-1]
        if matrix:
            for row in matrix[::-1]:
                res.append(row.pop(0))
    return res`,

  "longest-increasing-subsequence": `def length_of_lis(nums):
    import bisect
    tails = []
    for n in nums:
        i = bisect.bisect_left(tails, n)
        if i == len(tails):
            tails.append(n)
        else:
            tails[i] = n
    return len(tails)`,
};

SOLUTION_MAPS.python = CODING_PYTHON_SOLUTIONS;

function normalizeSolutionLanguage(language: string): CodingSolutionLanguage {
  if (language === "javascript" || language === "java" || language === "cpp") {
    return language;
  }
  return "python";
}

/** Extracts the approach line from a stored official-solution string. */
export function extractApproachFromStoredSolution(stored: string): string {
  const match = stored.match(/^Approach:\s*([\s\S]+?)(?:\n\n|$)/);
  if (match) return match[1].trim();
  const beforeRef = stored.split(/\n\n(?:Python|JavaScript|Java|C\+\+) reference:/)[0];
  return beforeRef.replace(/^Approach:\s*/, "").trim() || stored.trim();
}

/** Builds official solution text for the selected editor language. */
export function resolveOfficialSolution(
  slug: string,
  language: string,
  approach: string,
): string {
  const lang = normalizeSolutionLanguage(language);
  const code = SOLUTION_MAPS[lang][slug];
  const lines = [`Approach: ${approach}`];

  if (code) {
    lines.push("", `${LANGUAGE_LABELS[lang]} reference:`, code);
    return lines.join("\n");
  }

  const fallback = CODING_PYTHON_SOLUTIONS[slug];
  if (fallback && lang !== "python") {
    lines.push(
      "",
      `${LANGUAGE_LABELS[lang]} reference:`,
      "(Translation coming soon.)",
      "",
      "Python reference:",
      fallback,
    );
  } else if (fallback) {
    lines.push("", "Python reference:", fallback);
  } else {
    lines.push("", "(Reference code coming soon — use the approach above as your guide.)");
  }

  return lines.join("\n");
}

/** Builds the official solution text stored in the database. */
export function formatOfficialSolution(slug: string, approach: string): string {
  return resolveOfficialSolution(slug, "python", approach);
}

/** Resolves a progressive hint for a problem slug. */
export function resolveCodingHint(slug: string, approach: string): string {
  return (
    CODING_HINTS[slug] ??
    `Focus on the constraints. The optimal approach relates to: ${approach.replace(/\.$/, "").toLowerCase()}.`
  );
}
