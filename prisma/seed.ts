import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PROBLEMS = [
  {
    title: "Two Sum",
    slug: "two-sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
    difficulty: "EASY" as const,
    topic: "Arrays",
    starterCode: {
      python: "def two_sum(nums, target):\n    # Your code here\n    pass",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}",
      javascript: "function twoSum(nums, target) {\n  // Your code here\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};",
    },
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
      { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
    ],
    solution: "Use a hash map to store complements.",
    timeLimit: 30,
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "EASY" as const,
    topic: "Stack",
    starterCode: {
      python: "def is_valid(s):\n    # Your code here\n    pass",
      java: "class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}",
      javascript: "function isValid(s) {\n  // Your code here\n}",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};",
    },
    testCases: [
      { input: "\"()\"", expectedOutput: "true" },
      { input: "\"(]\"", expectedOutput: "false" },
    ],
    solution: "Use a stack to match brackets.",
    timeLimit: 20,
  },
  {
    title: "Merge Intervals",
    slug: "merge-intervals",
    description:
      "Given an array of intervals, merge all overlapping intervals.",
    difficulty: "MEDIUM" as const,
    topic: "Sorting",
    starterCode: {
      python: "def merge(intervals):\n    pass",
      java: "class Solution {\n    public int[][] merge(int[][] intervals) {\n        return new int[][]{};\n    }\n}",
      javascript: "function merge(intervals) {\n  // Your code here\n}",
      cpp: "class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        return {};\n    }\n};",
    },
    testCases: [
      { input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]" },
    ],
    solution: "Sort by start time, then merge.",
    timeLimit: 30,
  },
  {
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "MEDIUM" as const,
    topic: "Sliding Window",
    starterCode: {
      python: "def length_of_longest_substring(s):\n    pass",
      java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}",
      javascript: "function lengthOfLongestSubstring(s) {\n  // Your code here\n}",
      cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};",
    },
    testCases: [
      { input: "\"abcabcbb\"", expectedOutput: "3" },
    ],
    solution: "Use sliding window with a hash set.",
    timeLimit: 25,
  },
  {
    title: "Binary Tree Level Order Traversal",
    slug: "binary-tree-level-order",
    description:
      "Return the level order traversal of a binary tree's nodes' values.",
    difficulty: "MEDIUM" as const,
    topic: "Trees",
    starterCode: {
      python: "def level_order(root):\n    pass",
      java: "class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        return new ArrayList<>();\n    }\n}",
      javascript: "function levelOrder(root) {\n  // Your code here\n}",
      cpp: "class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        return {};\n    }\n};",
    },
    testCases: [
      { input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]" },
    ],
    solution: "Use BFS with a queue.",
    timeLimit: 25,
  },
  {
    title: "Word Ladder",
    slug: "word-ladder",
    description:
      "Return the number of words in the shortest transformation sequence from beginWord to endWord.",
    difficulty: "HARD" as const,
    topic: "Graph",
    starterCode: {
      python: "def ladder_length(begin_word, end_word, word_list):\n    pass",
      java: "class Solution {\n    public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n        return 0;\n    }\n}",
      javascript: "function ladderLength(beginWord, endWord, wordList) {\n  // Your code here\n}",
      cpp: "class Solution {\npublic:\n    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n        return 0;\n    }\n};",
    },
    testCases: [
      { input: "\"hit\", \"cog\", [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]", expectedOutput: "5" },
    ],
    solution: "Use BFS on the word graph.",
    timeLimit: 35,
  },
];

/** Seeds coding problems into the database. */
async function main() {
  console.log("Seeding coding problems...");

  for (const problem of PROBLEMS) {
    await prisma.codingProblem.upsert({
      where: { slug: problem.slug },
      update: problem,
      create: problem,
    });
  }

  console.log(`Seeded ${PROBLEMS.length} coding problems.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
