/** Reference JavaScript implementations shown in Official Solution. */
export const CODING_JAVASCRIPT_SOLUTIONS: Record<string, string> = {
  "two-sum": `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const n = nums[i];
    if (seen.has(target - n)) {
      return [seen.get(target - n), i];
    }
    seen.set(n, i);
  }
}`,

  "valid-parentheses": `function isValid(s) {
  const stack = [];
  const match = { ")": "(", "]": "[", "}": "{" };
  for (const c of s) {
    if (c in match) {
      if (!stack.length || stack.pop() !== match[c]) {
        return false;
      }
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
}`,

  "best-time-to-buy-sell-stock": `function maxProfit(prices) {
  let best = 0;
  let low = prices[0];
  for (let i = 1; i < prices.length; i++) {
    const p = prices[i];
    best = Math.max(best, p - low);
    low = Math.min(low, p);
  }
  return best;
}`,

  "contains-duplicate": `function containsDuplicate(nums) {
  return new Set(nums).size !== nums.length;
}`,

  "valid-anagram": `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (const c of s) {
    count[c] = (count[c] || 0) + 1;
  }
  for (const c of t) {
    count[c] = (count[c] || 0) - 1;
    if (count[c] < 0) return false;
  }
  return true;
}`,

  "maximum-subarray": `function maxSubArray(nums) {
  let best = nums[0];
  let cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const n = nums[i];
    cur = Math.max(n, cur + n);
    best = Math.max(best, cur);
  }
  return best;
}`,

  "climbing-stairs": `function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1;
  let b = 2;
  for (let i = 3; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}`,

  "move-zeroes": `function moveZeroes(nums) {
  let j = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[j], nums[i]] = [nums[i], nums[j]];
      j++;
    }
  }
  return nums;
}`,

  "reverse-string": `function reverseString(chars) {
  let l = 0;
  let r = chars.length - 1;
  while (l < r) {
    [chars[l], chars[r]] = [chars[r], chars[l]];
    l++;
    r--;
  }
  return chars;
}`,

  "palindrome-number": `function isPalindrome(x) {
  if (x < 0 || (x % 10 === 0 && x !== 0)) return false;
  let rev = 0;
  while (x > rev) {
    rev = rev * 10 + x % 10;
    x = Math.floor(x / 10);
  }
  return x === rev || x === Math.floor(rev / 10);
}`,

  "roman-to-integer": `function romanToInt(s) {
  const vals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    if (i + 1 < s.length && vals[s[i]] < vals[s[i + 1]]) {
      total -= vals[s[i]];
    } else {
      total += vals[s[i]];
    }
  }
  return total;
}`,

  "single-number": `function singleNumber(nums) {
  let x = 0;
  for (const n of nums) {
    x ^= n;
  }
  return x;
}`,

  "missing-number": `function missingNumber(nums) {
  const n = nums.length;
  return (n * (n + 1)) / 2 - nums.reduce((a, b) => a + b, 0);
}`,

  "plus-one": `function plusOne(digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
      digits[i]++;
      return digits;
    }
    digits[i] = 0;
  }
  return [1, ...digits];
}`,

  "happy-number": `function isHappy(n) {
  const seen = new Set();
  while (!seen.has(n)) {
    seen.add(n);
    n = String(n)
      .split("")
      .reduce((sum, d) => sum + Number(d) ** 2, 0);
    if (n === 1) return true;
  }
  return false;
}`,

  "remove-duplicates": `function removeDuplicates(nums) {
  if (!nums.length) return 0;
  let j = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1]) {
      nums[j] = nums[i];
      j++;
    }
  }
  return j;
}`,

  "sqrt-x": `function mySqrt(x) {
  if (x < 2) return x;
  let lo = 2;
  let hi = Math.floor(x / 2);
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (mid * mid === x) return mid;
    if (mid * mid < x) lo = mid + 1;
    else hi = mid - 1;
  }
  return hi;
}`,

  "merge-intervals": `function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const out = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const [s, e] = intervals[i];
    const last = out[out.length - 1];
    if (s <= last[1]) {
      last[1] = Math.max(last[1], e);
    } else {
      out.push([s, e]);
    }
  }
  return out;
}`,

  "longest-substring": `function lengthOfLongestSubstring(s) {
  const last = new Map();
  let start = 0;
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (last.has(c) && last.get(c) >= start) {
      start = last.get(c) + 1;
    }
    last.set(c, i);
    best = Math.max(best, i - start + 1);
  }
  return best;
}`,

  "product-except-self": `function productExceptSelf(nums) {
  const n = nums.length;
  const out = new Array(n).fill(1);
  let p = 1;
  for (let i = 0; i < n; i++) {
    out[i] = p;
    p *= nums[i];
  }
  p = 1;
  for (let i = n - 1; i >= 0; i--) {
    out[i] *= p;
    p *= nums[i];
  }
  return out;
}`,

  "container-with-most-water": `function maxArea(height) {
  let l = 0;
  let r = height.length - 1;
  let best = 0;
  while (l < r) {
    best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
    if (height[l] < height[r]) l++;
    else r--;
  }
  return best;
}`,

  "three-sum": `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i && nums[i] === nums[i - 1]) continue;
    let l = i + 1;
    let r = nums.length - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (s === 0) {
        res.push([nums[i], nums[l], nums[r]]);
        l++;
        while (l < r && nums[l] === nums[l - 1]) l++;
      } else if (s < 0) {
        l++;
      } else {
        r--;
      }
    }
  }
  return res;
}`,

  "coin-change": `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) {
        dp[a] = Math.min(dp[a], dp[a - c] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,

  "house-robber": `function rob(nums) {
  let prev = 0;
  let cur = 0;
  for (const n of nums) {
    [prev, cur] = [cur, Math.max(cur, prev + n)];
  }
  return cur;
}`,

  "unique-paths": `function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      row[j] += row[j - 1];
    }
  }
  return row[n - 1];
}`,

  "decode-ways": `function numDecodings(s) {
  if (!s || s[0] === "0") return 0;
  const dp = new Array(s.length + 1).fill(0);
  dp[0] = 1;
  dp[1] = 1;
  for (let i = 2; i <= s.length; i++) {
    if (s[i - 1] !== "0") dp[i] += dp[i - 1];
    const two = Number(s.slice(i - 2, i));
    if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
  }
  return dp[s.length];
}`,

  "jump-game": `function canJump(nums) {
  let reach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}`,

  "daily-temperatures": `function dailyTemperatures(temps) {
  const res = new Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const j = stack.pop();
      res[j] = i - j;
    }
    stack.push(i);
  }
  return res;
}`,

  "subarray-sum-equals-k": `function subarraySum(nums, k) {
  let count = 0;
  let prefix = 0;
  const freq = new Map([[0, 1]]);
  for (const n of nums) {
    prefix += n;
    count += freq.get(prefix - k) || 0;
    freq.set(prefix, (freq.get(prefix) || 0) + 1);
  }
  return count;
}`,

  "find-anagrams": `function findAnagrams(s, p) {
  const need = new Array(26).fill(0);
  const have = new Array(26).fill(0);
  for (const c of p) need[c.charCodeAt(0) - 97]++;
  const res = [];
  const k = p.length;
  for (let i = 0; i < s.length; i++) {
    have[s.charCodeAt(i) - 97]++;
    if (i >= k) have[s.charCodeAt(i - k) - 97]--;
    if (i >= k - 1 && have.every((v, idx) => v === need[idx])) {
      res.push(i - k + 1);
    }
  }
  return res;
}`,

  "rotate-array": `function rotate(nums, k) {
  k %= nums.length;
  function rev(a, l, r) {
    while (l < r) {
      [a[l], a[r]] = [a[r], a[l]];
      l++;
      r--;
    }
  }
  rev(nums, 0, nums.length - 1);
  rev(nums, 0, k - 1);
  rev(nums, k, nums.length - 1);
  return nums;
}`,

  "sort-colors": `function sortColors(nums) {
  let lo = 0;
  let mid = 0;
  let hi = nums.length - 1;
  while (mid <= hi) {
    if (nums[mid] === 0) {
      [nums[lo], nums[mid]] = [nums[mid], nums[lo]];
      lo++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[hi]] = [nums[hi], nums[mid]];
      hi--;
    }
  }
  return nums;
}`,

  "search-rotated-array": `function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`,

  "kth-largest": `function findKthLargest(nums, k) {
  const heap = nums.slice(0, k);
  heap.sort((a, b) => a - b);
  for (let i = k; i < nums.length; i++) {
    if (nums[i] > heap[0]) {
      heap[0] = nums[i];
      heap.sort((a, b) => a - b);
    }
  }
  return heap[0];
}`,

  "word-break": `function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}`,

  "spiral-matrix": `function spiralOrder(matrix) {
  const res = [];
  while (matrix.length) {
    res.push(...matrix.shift());
    if (matrix.length && matrix[0].length) {
      for (const row of matrix) {
        res.push(row.pop());
      }
    }
    if (matrix.length) {
      res.push(...matrix.pop().reverse());
    }
    if (matrix.length) {
      for (let i = matrix.length - 1; i >= 0; i--) {
        res.push(matrix[i].shift());
      }
    }
  }
  return res;
}`,

  "longest-increasing-subsequence": `function lengthOfLIS(nums) {
  const tails = [];
  for (const n of nums) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (tails[mid] < n) lo = mid + 1;
      else hi = mid;
    }
    if (lo === tails.length) tails.push(n);
    else tails[lo] = n;
  }
  return tails.length;
}`,
};

/** Reference Java implementations shown in Official Solution. */
export const CODING_JAVA_SOLUTIONS: Record<string, string> = {
  "two-sum": `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if (seen.containsKey(target - nums[i])) {
                return new int[] { seen.get(target - nums[i]), i };
            }
            seen.put(nums[i], i);
        }
        return new int[] {};
    }
}`,

  "valid-parentheses": `class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        Map<Character, Character> match = Map.of(')', '(', ']', '[', '}', '{');
        for (char c : s.toCharArray()) {
            if (match.containsKey(c)) {
                if (stack.isEmpty() || stack.pop() != match.get(c)) {
                    return false;
                }
            } else {
                stack.push(c);
            }
        }
        return stack.isEmpty();
    }
}`,

  "best-time-to-buy-sell-stock": `class Solution {
    public int maxProfit(int[] prices) {
        int best = 0;
        int low = prices[0];
        for (int i = 1; i < prices.length; i++) {
            best = Math.max(best, prices[i] - low);
            low = Math.min(low, prices[i]);
        }
        return best;
    }
}`,

  "contains-duplicate": `class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int n : nums) {
            if (!seen.add(n)) return true;
        }
        return false;
    }
}`,

  "valid-anagram": `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
            if (count[t.charAt(i) - 'a'] < 0) return false;
        }
        return true;
    }
}`,

  "maximum-subarray": `class Solution {
    public int maxSubArray(int[] nums) {
        int best = nums[0];
        int cur = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            best = Math.max(best, cur);
        }
        return best;
    }
}`,

  "climbing-stairs": `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1;
        int b = 2;
        for (int i = 3; i <= n; i++) {
            int tmp = a + b;
            a = b;
            b = tmp;
        }
        return b;
    }
}`,

  "move-zeroes": `class Solution {
    public int[] moveZeroes(int[] nums) {
        int j = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != 0) {
                int tmp = nums[j];
                nums[j] = nums[i];
                nums[i] = tmp;
                j++;
            }
        }
        return nums;
    }
}`,

  "reverse-string": `class Solution {
    public String[] reverseString(String[] chars) {
        int l = 0;
        int r = chars.length - 1;
        while (l < r) {
            String tmp = chars[l];
            chars[l] = chars[r];
            chars[r] = tmp;
            l++;
            r--;
        }
        return chars;
    }
}`,

  "palindrome-number": `class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0)) return false;
        int rev = 0;
        while (x > rev) {
            rev = rev * 10 + x % 10;
            x /= 10;
        }
        return x == rev || x == rev / 10;
    }
}`,

  "roman-to-integer": `class Solution {
    public int romanToInt(String s) {
        Map<Character, Integer> vals = Map.of(
            'I', 1, 'V', 5, 'X', 10, 'L', 50,
            'C', 100, 'D', 500, 'M', 1000
        );
        int total = 0;
        for (int i = 0; i < s.length(); i++) {
            if (i + 1 < s.length() && vals.get(s.charAt(i)) < vals.get(s.charAt(i + 1))) {
                total -= vals.get(s.charAt(i));
            } else {
                total += vals.get(s.charAt(i));
            }
        }
        return total;
    }
}`,

  "single-number": `class Solution {
    public int singleNumber(int[] nums) {
        int x = 0;
        for (int n : nums) {
            x ^= n;
        }
        return x;
    }
}`,

  "missing-number": `class Solution {
    public int missingNumber(int[] nums) {
        int n = nums.length;
        int sum = 0;
        for (int num : nums) sum += num;
        return n * (n + 1) / 2 - sum;
    }
}`,

  "plus-one": `class Solution {
    public int[] plusOne(int[] digits) {
        for (int i = digits.length - 1; i >= 0; i--) {
            if (digits[i] < 9) {
                digits[i]++;
                return digits;
            }
            digits[i] = 0;
        }
        int[] out = new int[digits.length + 1];
        out[0] = 1;
        return out;
    }
}`,

  "happy-number": `class Solution {
    public boolean isHappy(int n) {
        Set<Integer> seen = new HashSet<>();
        while (!seen.contains(n)) {
            seen.add(n);
            int sum = 0;
            while (n > 0) {
                int d = n % 10;
                sum += d * d;
                n /= 10;
            }
            n = sum;
            if (n == 1) return true;
        }
        return false;
    }
}`,

  "remove-duplicates": `class Solution {
    public int removeDuplicates(int[] nums) {
        if (nums.length == 0) return 0;
        int j = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] != nums[i - 1]) {
                nums[j] = nums[i];
                j++;
            }
        }
        return j;
    }
}`,

  "sqrt-x": `class Solution {
    public int mySqrt(int x) {
        if (x < 2) return x;
        int lo = 2;
        int hi = x / 2;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (mid == x / mid) return mid;
            if ((long) mid * mid < x) lo = mid + 1;
            else hi = mid - 1;
        }
        return hi;
    }
}`,

  "merge-intervals": `class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));
        List<int[]> out = new ArrayList<>();
        out.add(intervals[0]);
        for (int i = 1; i < intervals.length; i++) {
            int[] cur = intervals[i];
            int[] last = out.get(out.size() - 1);
            if (cur[0] <= last[1]) {
                last[1] = Math.max(last[1], cur[1]);
            } else {
                out.add(cur);
            }
        }
        return out.toArray(new int[out.size()][]);
    }
}`,

  "longest-substring": `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int start = 0;
        int best = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (last.containsKey(c) && last.get(c) >= start) {
                start = last.get(c) + 1;
            }
            last.put(c, i);
            best = Math.max(best, i - start + 1);
        }
        return best;
    }
}`,

  "product-except-self": `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] out = new int[n];
        int p = 1;
        for (int i = 0; i < n; i++) {
            out[i] = p;
            p *= nums[i];
        }
        p = 1;
        for (int i = n - 1; i >= 0; i--) {
            out[i] *= p;
            p *= nums[i];
        }
        return out;
    }
}`,

  "container-with-most-water": `class Solution {
    public int maxArea(int[] height) {
        int l = 0;
        int r = height.length - 1;
        int best = 0;
        while (l < r) {
            best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return best;
    }
}`,

  "three-sum": `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1;
            int r = nums.length - 1;
            while (l < r) {
                int s = nums[i] + nums[l] + nums[r];
                if (s == 0) {
                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    l++;
                    while (l < r && nums[l] == nums[l - 1]) l++;
                } else if (s < 0) {
                    l++;
                } else {
                    r--;
                }
            }
        }
        return res;
    }
}`,

  "coin-change": `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a) {
                    dp[a] = Math.min(dp[a], dp[a - c] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,

  "house-robber": `class Solution {
    public int rob(int[] nums) {
        int prev = 0;
        int cur = 0;
        for (int n : nums) {
            int tmp = Math.max(cur, prev + n);
            prev = cur;
            cur = tmp;
        }
        return cur;
    }
}`,

  "unique-paths": `class Solution {
    public int uniquePaths(int m, int n) {
        int[] row = new int[n];
        Arrays.fill(row, 1);
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                row[j] += row[j - 1];
            }
        }
        return row[n - 1];
    }
}`,

  "decode-ways": `class Solution {
    public int numDecodings(String s) {
        if (s.isEmpty() || s.charAt(0) == '0') return 0;
        int[] dp = new int[s.length() + 1];
        dp[0] = 1;
        dp[1] = 1;
        for (int i = 2; i <= s.length(); i++) {
            if (s.charAt(i - 1) != '0') dp[i] += dp[i - 1];
            int two = Integer.parseInt(s.substring(i - 2, i));
            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
        }
        return dp[s.length()];
    }
}`,

  "jump-game": `class Solution {
    public boolean canJump(int[] nums) {
        int reach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > reach) return false;
            reach = Math.max(reach, i + nums[i]);
        }
        return true;
    }
}`,

  "daily-temperatures": `class Solution {
    public int[] dailyTemperatures(int[] temps) {
        int[] res = new int[temps.length];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < temps.length; i++) {
            while (!stack.isEmpty() && temps[stack.peek()] < temps[i]) {
                int j = stack.pop();
                res[j] = i - j;
            }
            stack.push(i);
        }
        return res;
    }
}`,

  "subarray-sum-equals-k": `class Solution {
    public int subarraySum(int[] nums, int k) {
        int count = 0;
        int prefix = 0;
        Map<Integer, Integer> freq = new HashMap<>();
        freq.put(0, 1);
        for (int n : nums) {
            prefix += n;
            count += freq.getOrDefault(prefix - k, 0);
            freq.put(prefix, freq.getOrDefault(prefix, 0) + 1);
        }
        return count;
    }
}`,

  "find-anagrams": `class Solution {
    public List<Integer> findAnagrams(String s, String p) {
        int[] need = new int[26];
        int[] have = new int[26];
        for (char c : p.toCharArray()) need[c - 'a']++;
        List<Integer> res = new ArrayList<>();
        int k = p.length();
        for (int i = 0; i < s.length(); i++) {
            have[s.charAt(i) - 'a']++;
            if (i >= k) have[s.charAt(i - k) - 'a']--;
            if (i >= k - 1 && Arrays.equals(have, need)) {
                res.add(i - k + 1);
            }
        }
        return res;
    }
}`,

  "rotate-array": `class Solution {
    public int[] rotate(int[] nums, int k) {
        k %= nums.length;
        reverse(nums, 0, nums.length - 1);
        reverse(nums, 0, k - 1);
        reverse(nums, k, nums.length - 1);
        return nums;
    }

    private void reverse(int[] a, int l, int r) {
        while (l < r) {
            int tmp = a[l];
            a[l] = a[r];
            a[r] = tmp;
            l++;
            r--;
        }
    }
}`,

  "sort-colors": `class Solution {
    public int[] sortColors(int[] nums) {
        int lo = 0;
        int mid = 0;
        int hi = nums.length - 1;
        while (mid <= hi) {
            if (nums[mid] == 0) {
                swap(nums, lo, mid);
                lo++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                swap(nums, mid, hi);
                hi--;
            }
        }
        return nums;
    }

    private void swap(int[] nums, int i, int j) {
        int tmp = nums[i];
        nums[i] = nums[j];
        nums[j] = tmp;
    }
}`,

  "search-rotated-array": `class Solution {
    public int search(int[] nums, int target) {
        int lo = 0;
        int hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }
}`,

  "kth-largest": `class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int i = 0; i < k; i++) heap.offer(nums[i]);
        for (int i = k; i < nums.length; i++) {
            if (nums[i] > heap.peek()) {
                heap.poll();
                heap.offer(nums[i]);
            }
        }
        return heap.peek();
    }
}`,

  "word-break": `class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> words = new HashSet<>(wordDict);
        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true;
        for (int i = 1; i <= s.length(); i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && words.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[s.length()];
    }
}`,

  "spiral-matrix": `class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> res = new ArrayList<>();
        int top = 0;
        int bottom = matrix.length - 1;
        int left = 0;
        int right = matrix[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) res.add(matrix[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) res.add(matrix[i][right]);
            right--;
            if (top <= bottom) {
                for (int j = right; j >= left; j--) res.add(matrix[bottom][j]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) res.add(matrix[i][left]);
                left++;
            }
        }
        return res;
    }
}`,

  "longest-increasing-subsequence": `class Solution {
    public int lengthOfLIS(int[] nums) {
        List<Integer> tails = new ArrayList<>();
        for (int n : nums) {
            int i = Collections.binarySearch(tails, n);
            if (i < 0) i = -(i + 1);
            if (i == tails.size()) tails.add(n);
            else tails.set(i, n);
        }
        return tails.size();
    }
}`,
};

/** Reference C++ implementations shown in Official Solution. */
export const CODING_CPP_SOLUTIONS: Record<string, string> = {
  "two-sum": `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            if (seen.count(target - nums[i])) {
                return { seen[target - nums[i]], i };
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,

  "valid-parentheses": `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        unordered_map<char, char> match = {{')', '('}, {']', '['}, {'}', '{'}};
        for (char c : s) {
            if (match.count(c)) {
                if (st.empty() || st.top() != match[c]) return false;
                st.pop();
            } else {
                st.push(c);
            }
        }
        return st.empty();
    }
};`,

  "best-time-to-buy-sell-stock": `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int best = 0;
        int low = prices[0];
        for (int i = 1; i < prices.size(); i++) {
            best = max(best, prices[i] - low);
            low = min(low, prices[i]);
        }
        return best;
    }
};`,

  "contains-duplicate": `class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int n : nums) {
            if (!seen.insert(n).second) return true;
        }
        return false;
    }
};`,

  "valid-anagram": `class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        int count[26] = {};
        for (int i = 0; i < s.size(); i++) {
            count[s[i] - 'a']++;
            count[t[i] - 'a']--;
            if (count[t[i] - 'a'] < 0) return false;
        }
        return true;
    }
};`,

  "maximum-subarray": `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int best = nums[0];
        int cur = nums[0];
        for (int i = 1; i < nums.size(); i++) {
            cur = max(nums[i], cur + nums[i]);
            best = max(best, cur);
        }
        return best;
    }
};`,

  "climbing-stairs": `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1;
        int b = 2;
        for (int i = 3; i <= n; i++) {
            int tmp = a + b;
            a = b;
            b = tmp;
        }
        return b;
    }
};`,

  "move-zeroes": `class Solution {
public:
    vector<int> moveZeroes(vector<int>& nums) {
        int j = 0;
        for (int i = 0; i < nums.size(); i++) {
            if (nums[i] != 0) {
                swap(nums[j], nums[i]);
                j++;
            }
        }
        return nums;
    }
};`,

  "reverse-string": `class Solution {
public:
    vector<char> reverseString(vector<char>& chars) {
        int l = 0;
        int r = chars.size() - 1;
        while (l < r) {
            swap(chars[l], chars[r]);
            l++;
            r--;
        }
        return chars;
    }
};`,

  "palindrome-number": `class Solution {
public:
    bool isPalindrome(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0)) return false;
        int rev = 0;
        while (x > rev) {
            rev = rev * 10 + x % 10;
            x /= 10;
        }
        return x == rev || x == rev / 10;
    }
};`,

  "roman-to-integer": `class Solution {
public:
    int romanToInt(string s) {
        unordered_map<char, int> vals = {
            {'I', 1}, {'V', 5}, {'X', 10}, {'L', 50},
            {'C', 100}, {'D', 500}, {'M', 1000}
        };
        int total = 0;
        for (int i = 0; i < s.size(); i++) {
            if (i + 1 < s.size() && vals[s[i]] < vals[s[i + 1]]) {
                total -= vals[s[i]];
            } else {
                total += vals[s[i]];
            }
        }
        return total;
    }
};`,

  "single-number": `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int x = 0;
        for (int n : nums) x ^= n;
        return x;
    }
};`,

  "missing-number": `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int n = nums.size();
        int sum = 0;
        for (int num : nums) sum += num;
        return n * (n + 1) / 2 - sum;
    }
};`,

  "plus-one": `class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        for (int i = digits.size() - 1; i >= 0; i--) {
            if (digits[i] < 9) {
                digits[i]++;
                return digits;
            }
            digits[i] = 0;
        }
        digits.insert(digits.begin(), 1);
        return digits;
    }
};`,

  "happy-number": `class Solution {
public:
    bool isHappy(int n) {
        unordered_set<int> seen;
        while (!seen.count(n)) {
            seen.insert(n);
            int sum = 0;
            while (n > 0) {
                int d = n % 10;
                sum += d * d;
                n /= 10;
            }
            n = sum;
            if (n == 1) return true;
        }
        return false;
    }
};`,

  "remove-duplicates": `class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.empty()) return 0;
        int j = 1;
        for (int i = 1; i < nums.size(); i++) {
            if (nums[i] != nums[i - 1]) {
                nums[j] = nums[i];
                j++;
            }
        }
        return j;
    }
};`,

  "sqrt-x": `class Solution {
public:
    int mySqrt(int x) {
        if (x < 2) return x;
        int lo = 2;
        int hi = x / 2;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if ((long long)mid * mid == x) return mid;
            if ((long long)mid * mid < x) lo = mid + 1;
            else hi = mid - 1;
        }
        return hi;
    }
};`,

  "merge-intervals": `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> out = { intervals[0] };
        for (int i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] <= out.back()[1]) {
                out.back()[1] = max(out.back()[1], intervals[i][1]);
            } else {
                out.push_back(intervals[i]);
            }
        }
        return out;
    }
};`,

  "longest-substring": `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> last;
        int start = 0;
        int best = 0;
        for (int i = 0; i < s.size(); i++) {
            char c = s[i];
            if (last.count(c) && last[c] >= start) {
                start = last[c] + 1;
            }
            last[c] = i;
            best = max(best, i - start + 1);
        }
        return best;
    }
};`,

  "product-except-self": `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> out(n, 1);
        int p = 1;
        for (int i = 0; i < n; i++) {
            out[i] = p;
            p *= nums[i];
        }
        p = 1;
        for (int i = n - 1; i >= 0; i--) {
            out[i] *= p;
            p *= nums[i];
        }
        return out;
    }
};`,

  "container-with-most-water": `class Solution {
public:
    int maxArea(vector<int>& height) {
        int l = 0;
        int r = height.size() - 1;
        int best = 0;
        while (l < r) {
            best = max(best, min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return best;
    }
};`,

  "three-sum": `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        for (int i = 0; i < (int)nums.size() - 2; i++) {
            if (i && nums[i] == nums[i - 1]) continue;
            int l = i + 1;
            int r = nums.size() - 1;
            while (l < r) {
                int s = nums[i] + nums[l] + nums[r];
                if (s == 0) {
                    res.push_back({ nums[i], nums[l], nums[r] });
                    l++;
                    while (l < r && nums[l] == nums[l - 1]) l++;
                } else if (s < 0) {
                    l++;
                } else {
                    r--;
                }
            }
        }
        return res;
    }
};`,

  "coin-change": `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a) {
                    dp[a] = min(dp[a], dp[a - c] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`,

  "house-robber": `class Solution {
public:
    int rob(vector<int>& nums) {
        int prev = 0;
        int cur = 0;
        for (int n : nums) {
            int tmp = max(cur, prev + n);
            prev = cur;
            cur = tmp;
        }
        return cur;
    }
};`,

  "unique-paths": `class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<int> row(n, 1);
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                row[j] += row[j - 1];
            }
        }
        return row[n - 1];
    }
};`,

  "decode-ways": `class Solution {
public:
    int numDecodings(string s) {
        if (s.empty() || s[0] == '0') return 0;
        vector<int> dp(s.size() + 1, 0);
        dp[0] = 1;
        dp[1] = 1;
        for (int i = 2; i <= (int)s.size(); i++) {
            if (s[i - 1] != '0') dp[i] += dp[i - 1];
            int two = stoi(s.substr(i - 2, 2));
            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
        }
        return dp[s.size()];
    }
};`,

  "jump-game": `class Solution {
public:
    bool canJump(vector<int>& nums) {
        int reach = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (i > reach) return false;
            reach = max(reach, i + nums[i]);
        }
        return true;
    }
};`,

  "daily-temperatures": `class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temps) {
        vector<int> res(temps.size(), 0);
        stack<int> st;
        for (int i = 0; i < (int)temps.size(); i++) {
            while (!st.empty() && temps[st.top()] < temps[i]) {
                int j = st.top();
                st.pop();
                res[j] = i - j;
            }
            st.push(i);
        }
        return res;
    }
};`,

  "subarray-sum-equals-k": `class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        int count = 0;
        int prefix = 0;
        unordered_map<int, int> freq;
        freq[0] = 1;
        for (int n : nums) {
            prefix += n;
            count += freq[prefix - k];
            freq[prefix]++;
        }
        return count;
    }
};`,

  "find-anagrams": `class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        vector<int> need(26, 0);
        vector<int> have(26, 0);
        for (char c : p) need[c - 'a']++;
        vector<int> res;
        int k = p.size();
        for (int i = 0; i < (int)s.size(); i++) {
            have[s[i] - 'a']++;
            if (i >= k) have[s[i - k] - 'a']--;
            if (i >= k - 1 && have == need) {
                res.push_back(i - k + 1);
            }
        }
        return res;
    }
};`,

  "rotate-array": `class Solution {
public:
    vector<int> rotate(vector<int>& nums, int k) {
        k %= nums.size();
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
        return nums;
    }
};`,

  "sort-colors": `class Solution {
public:
    vector<int> sortColors(vector<int>& nums) {
        int lo = 0;
        int mid = 0;
        int hi = nums.size() - 1;
        while (mid <= hi) {
            if (nums[mid] == 0) {
                swap(nums[lo], nums[mid]);
                lo++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                swap(nums[mid], nums[hi]);
                hi--;
            }
        }
        return nums;
    }
};`,

  "search-rotated-array": `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0;
        int hi = nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }
};`,

  "kth-largest": `class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> heap(nums.begin(), nums.begin() + k);
        for (int i = k; i < (int)nums.size(); i++) {
            if (nums[i] > heap.top()) {
                heap.pop();
                heap.push(nums[i]);
            }
        }
        return heap.top();
    }
};`,

  "word-break": `class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> words(wordDict.begin(), wordDict.end());
        vector<bool> dp(s.size() + 1, false);
        dp[0] = true;
        for (int i = 1; i <= (int)s.size(); i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && words.count(s.substr(j, i - j))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[s.size()];
    }
};`,

  "spiral-matrix": `class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        vector<int> res;
        int top = 0;
        int bottom = matrix.size() - 1;
        int left = 0;
        int right = matrix[0].size() - 1;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) res.push_back(matrix[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) res.push_back(matrix[i][right]);
            right--;
            if (top <= bottom) {
                for (int j = right; j >= left; j--) res.push_back(matrix[bottom][j]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) res.push_back(matrix[i][left]);
                left++;
            }
        }
        return res;
    }
};`,

  "longest-increasing-subsequence": `class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;
        for (int n : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), n);
            if (it == tails.end()) tails.push_back(n);
            else *it = n;
        }
        return tails.size();
    }
};`,
};
