import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Trophy,
  Users,
  Calendar,
  Medal,
  Activity,
  Swords,
  Dumbbell,
  Clock,
  MapPin,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";
import { fetchSportsTeams, fetchTournaments, fetchActivities } from "@/lib/sports-api";

export const Route = createFileRoute("/student/sports")({
  head: () => ({ meta: [{ title: "Sports & Activities · Campus OS" }] }),
  component: StudentSportsPage,
});

function StudentSportsPage() {
  const [tab, setTab] = useState<"teams" | "tournaments" | "enrollment">("teams");
  
  const [teams, setTeams] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [teamsData, tourData, actData] = await Promise.all([
          fetchSportsTeams(),
          fetchTournaments(),
          fetchActivities(),
        ]);
        setTeams(teamsData || []);
        setTournaments(tourData || []);
        setActivities(actData || []);
      } catch (err) {
        console.error("Failed to load student sports data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm font-semibold text-muted-foreground">
            Loading sports details...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <PageHeader
        title="Sports & Extracurriculars"
        subtitle="Explore active sports teams, match schedules, tournaments, and register/view extracurricular activities."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="My Sports Teams" 
          value={String(teams.filter(t => t.status === "Active").length)} 
          icon={Dumbbell} 
          tone="info" 
        />
        <StatCard 
          label="Upcoming Matches" 
          value={String(tournaments.length)} 
          icon={Swords} 
          tone="warning" 
        />
        <StatCard 
          label="Trophies Won (School)" 
          value="8" 
          icon={Trophy} 
          tone="success" 
          delta="Keep it up Spark!"
        />
        <StatCard
          label="Extracurriculars"
          value={String(activities.length)}
          icon={Activity}
          tone="success"
          delta="Active Programs"
        />
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 max-w-md">
        {(
          [
            ["teams", "Teams & Coaches", Users],
            ["tournaments", "Match Schedule", Calendar],
            ["enrollment", "Extracurricular Activities", Medal],
          ] as const
        ).map(([k, l, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k as any)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
              tab === k
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {l}
          </button>
        ))}
      </div>

      {tab === "teams" && (
        <Panel title="Sports Teams & Coaching Staff">
          {teams.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
              <Dumbbell className="h-8 w-8 mb-2 opacity-50" />
              <div className="text-sm font-medium">No teams found</div>
              <div className="text-xs">Active sports teams will appear here.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <div
                  key={team._id || team.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4 hover:shadow-md transition-shadow hover:border-primary/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-foreground text-base">{team.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Coach: {team.coach}</p>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium bg-muted/50 p-2 rounded-lg">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-4 w-4 text-foreground" /> {team.members} Members
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        team.status === "Active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}
                    >
                      {team.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground pt-2 border-t border-border flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Swords className="h-3.5 w-3.5 text-destructive" /> Next Match:
                    </span>
                    {team.nextMatch || "TBD"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {tab === "tournaments" && (
        <Panel title="Upcoming Matches & Tournament Schedule">
          {tournaments.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
              <Calendar className="h-8 w-8 mb-2 opacity-50" />
              <div className="text-sm font-medium">No matches scheduled</div>
              <div className="text-xs">New tournament matches will appear here.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map((t) => (
                <div
                  key={t._id || t.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card shadow-sm gap-4 hover:border-accent transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{t.name}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Clock className="h-3.5 w-3.5" /> {t.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="text-right">
                      <div className="text-foreground flex items-center justify-end gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {t.location}</div>
                      <div className="text-muted-foreground mt-0.5">{t.teams} Teams Competing</div>
                    </div>
                    <button className="h-8 px-4 rounded-lg bg-accent text-white font-semibold text-[10px] hover:bg-accent/90 transition-all uppercase tracking-wider">
                      View Bracket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {tab === "enrollment" && (
        <Panel title="Extracurricular Program Catalog">
          {activities.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
              <Medal className="h-8 w-8 mb-2 opacity-50" />
              <div className="text-sm font-medium">No programs available</div>
              <div className="text-xs">Extracurricular activities will show up here.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((a) => {
                const isFull = a.enrolled >= a.max;
                return (
                  <div key={a._id || a.id} className="p-4 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 flex flex-col justify-between h-48">
                    <div>
                      <h4 className="font-bold text-foreground mb-1 text-sm">{a.name}</h4>
                      <p className="text-xs text-muted-foreground mb-4">Instructor: {a.instructor}</p>
                    </div>

                    <div>
                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span>Enrollment Capacity</span>
                          <span className={isFull ? "text-destructive" : "text-foreground"}>
                            {a.enrolled} / {a.max}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isFull ? "bg-destructive" : "bg-emerald-500"}`}
                            style={{ width: `${(a.enrolled / a.max) * 100}%` }}
                          />
                        </div>
                      </div>

                      <button
                        disabled={isFull}
                        className={`w-full h-8 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${
                          isFull 
                            ? "bg-muted text-muted-foreground" 
                            : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                        }`}
                      >
                        {isFull ? "Waitlist Full" : "Enrolled"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
