import { motion } from "framer-motion";
import { FileText, Target, Briefcase, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import ScoreRing from "@/components/ScoreRing";

const recentUploads = [
  { name: "resume_v3.pdf", date: "2 hours ago", score: 87, status: "Analyzed" },
  { name: "cover_letter.docx", date: "1 day ago", score: 72, status: "Analyzed" },
  { name: "resume_senior.pdf", date: "3 days ago", score: 91, status: "Analyzed" },
];

const Dashboard = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Overview of your resume analysis activity</p>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Uploads" value={12} subtitle="+3 this week" icon={FileText} delay={0.1} />
          <StatCard title="Avg ATS Score" value="82%" subtitle="Above average" icon={Target} delay={0.15} />
          <StatCard title="Jobs Matched" value={28} subtitle="8 strong matches" icon={Briefcase} delay={0.2} />
          <StatCard title="Skills Found" value={47} subtitle="12 in-demand" icon={TrendingUp} delay={0.25} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Score Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6 lg:col-span-1"
          >
            <h2 className="text-lg font-semibold text-foreground">Latest Score</h2>
            <div className="mt-6 flex justify-center">
              <ScoreRing score={87} size={160} label="ATS Compatibility" />
            </div>
            <div className="mt-6 space-y-3">
              {[
                { label: "Formatting", val: 92 },
                { label: "Keywords", val: 78 },
                { label: "Experience", val: 88 },
                { label: "Education", val: 95 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-mono text-foreground">{item.val}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.val}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Uploads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl border border-border bg-card p-6 lg:col-span-2"
          >
            <h2 className="text-lg font-semibold text-foreground">Recent Uploads</h2>
            <div className="mt-4 space-y-3">
              {recentUploads.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {file.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-semibold text-foreground">{file.score}%</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      {file.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
