"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startInterview } from "@/actions/interview-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { COMPANIES, ROLES, EXPERIENCE_LEVELS, DIFFICULTIES } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/** Mock interview setup form. */
export function InterviewSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");

  const handleStart = async () => {
    if (!company || !role || !experience) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const session = await startInterview({
        company,
        role,
        experience,
        difficulty: difficulty as "EASY" | "MEDIUM" | "HARD",
      });
      router.push(`/mock-interview/${session.id}`);
    } catch {
      toast.error("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base">Configure Interview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Company</Label>
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
            <SelectContent>
              {COMPANIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Experience Level</Label>
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" onClick={handleStart} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Start Interview
        </Button>
      </CardContent>
    </Card>
  );
}
