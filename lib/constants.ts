export const APP_NAME = "PrepPilot AI";
export const APP_TAGLINE = "Ace Every Interview with AI.";

export const COMPANIES = [
  "Google",
  "Meta",
  "Amazon",
  "Microsoft",
  "Apple",
  "Netflix",
  "Stripe",
  "Airbnb",
  "Uber",
  "LinkedIn",
] as const;

export const ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Data Engineer",
  "DevOps Engineer",
  "Mobile Engineer",
] as const;

export const EXPERIENCE_LEVELS = [
  "Intern",
  "Entry Level",
  "Mid Level",
  "Senior",
  "Staff",
] as const;

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export const CODING_LANGUAGES = [
  { id: "python", label: "Python", monaco: "python" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "cpp", label: "C++", monaco: "cpp" },
] as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/resume", label: "Resume", icon: "FileText" },
  { href: "/mock-interview", label: "Mock Interview", icon: "MessageSquare" },
  { href: "/coding", label: "Coding", icon: "Code2" },
  { href: "/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/coach", label: "AI Coach", icon: "Sparkles" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const;

export const LANDING_FEATURES = [
  {
    title: "Resume Analyzer",
    description:
      "Upload your resume and get ATS scoring, skill gap analysis, and actionable improvements.",
    icon: "FileSearch",
  },
  {
    title: "Company Mock Interviews",
    description:
      "Practice with company-specific questions tailored to role, experience, and difficulty.",
    icon: "Building2",
  },
  {
    title: "Coding Assessments",
    description:
      "Solve real interview problems with a built-in editor, timer, and AI-powered feedback.",
    icon: "Terminal",
  },
  {
    title: "Interview Analytics",
    description:
      "Track your progress over time with elegant charts and performance insights.",
    icon: "TrendingUp",
  },
  {
    title: "AI Coach",
    description:
      "Get personalized career guidance, interview tips, and resume advice anytime.",
    icon: "Bot",
  },
  {
    title: "Detailed Reports",
    description:
      "Download comprehensive PDF reports for resumes and mock interview sessions.",
    icon: "Download",
  },
] as const;
