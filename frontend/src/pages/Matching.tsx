import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, TrendingUp, ArrowUpRight, Building2 } from "lucide-react";
import Layout from "@/components/Layout";
import ScoreRing from "@/components/ScoreRing";

const jobs = [
  {
    title: "Senior Frontend Engineer",
    company: "TechCorp",
    location: "San Francisco, CA",
    salary: "$180K - $220K",
    match: 94,
    skills: ["React", "TypeScript", "GraphQL"],
  },
  {
    title: "Full Stack Developer",
    company: "StartupXYZ",
    location: "Remote",
    salary: "$150K - $190K",
    match: 87,
    skills: ["React", "Node.js", "PostgreSQL"],
  },
  {
    title: "Software Engineer II",
    company: "BigTech Inc",
    location: "New York, NY",
    salary: "$160K - $200K",
    match: 82,
    skills: ["Python", "TypeScript", "AWS"],
  },
  {
    title: "Frontend Lead",
    company: "DesignStudio",
    location: "Austin, TX",
    salary: "$170K - $210K",
    match: 76,
    skills: ["React", "Design Systems", "Leadership"],
  },
];

const Matching = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Job Matching</h1>
          <p className="mt-1 text-muted-foreground">
            Jobs ranked by semantic similarity to your resume
          </p>
        </motion.div>

        <div className="mt-8 space-y-4">
          {jobs.map((job, i) => (
            <motion.div
              key={job.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-lg bg-primary/10 p-2.5">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{job.company}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" /> {job.salary}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                <ScoreRing score={job.match} size={70} label="Match" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Matching;
