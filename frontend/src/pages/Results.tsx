import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb } from "lucide-react";
import Layout from "@/components/Layout";
import ScoreRing from "@/components/ScoreRing";

const skills = [
  { name: "React", level: "Expert", match: true },
  { name: "TypeScript", level: "Advanced", match: true },
  { name: "Python", level: "Advanced", match: true },
  { name: "Node.js", level: "Intermediate", match: true },
  { name: "PostgreSQL", level: "Intermediate", match: false },
  { name: "Docker", level: "Beginner", match: false },
  { name: "AWS", level: "Intermediate", match: true },
  { name: "GraphQL", level: "Beginner", match: false },
];

const feedback = [
  { type: "success", icon: CheckCircle2, text: "Strong action verbs used throughout" },
  { type: "success", icon: CheckCircle2, text: "Quantified achievements in 4 of 5 roles" },
  { type: "warning", icon: AlertTriangle, text: "Consider adding more industry-specific keywords" },
  { type: "warning", icon: AlertTriangle, text: "Summary section could be more concise" },
  { type: "error", icon: XCircle, text: "Missing contact information (LinkedIn URL)" },
];

const Results = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Analysis Results</h1>
          <p className="mt-1 text-muted-foreground">resume_v3.pdf — analyzed just now</p>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">ATS Score</h2>
            <div className="flex justify-center">
              <ScoreRing score={87} size={180} />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { label: "Format", score: 92 },
                { label: "Keywords", score: 78 },
                { label: "Experience", score: 88 },
                { label: "Impact", score: 90 },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-background p-3 text-center">
                  <p className="font-mono text-xl font-bold text-foreground">{s.score}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Extracted Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.name}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
                    skill.match
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-secondary text-secondary-foreground border border-border"
                  }`}
                >
                  {skill.match && <CheckCircle2 className="h-3 w-3" />}
                  {skill.name}
                  <span className="text-xs opacity-60">· {skill.level}</span>
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-background p-4">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                Suggested Skills to Add
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Kubernetes", "CI/CD", "Agile", "REST APIs"].map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Feedback</h2>
            <div className="space-y-3">
              {feedback.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg p-3 ${
                    item.type === "success"
                      ? "bg-primary/5"
                      : item.type === "warning"
                      ? "bg-warning/5"
                      : "bg-destructive/5"
                  }`}
                >
                  <item.icon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      item.type === "success"
                        ? "text-primary"
                        : item.type === "warning"
                        ? "text-warning"
                        : "text-destructive"
                    }`}
                  />
                  <p className="text-sm text-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Results;
