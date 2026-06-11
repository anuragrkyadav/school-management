import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BookOpen, Search, BookMarked, Clock, BookmarkPlus, Download } from "lucide-react";
import { PageHeader, StatCard, Panel, EmptyState } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/student/library")({
  head: () => ({ meta: [{ title: "My Library · Campus OS" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"catalog" | "issued" | "reservations" | "fines" | "ebooks">("catalog");
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState<any[]>([]);
  const [circulations, setCirculations] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [ebooks, setEbooks] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      // For student, we pass their user ID implicitly or they get their own via the backend
      const [bRes, cRes, rRes, fRes, eRes] = await Promise.all([
        apiClient<any>("/library/books"),
        user?.studentId ? apiClient<any>(`/library/circulations/student/${user.studentId}`) : Promise.resolve([]),
        apiClient<any>("/library/reservations"),
        apiClient<any>("/library/fines"),
        apiClient<any>("/library/ebooks"),
      ]);
      setBooks(Array.isArray(bRes) ? bRes : bRes?.data || []);
      setCirculations(Array.isArray(cRes) ? cRes : cRes?.data || []);
      setReservations(Array.isArray(rRes) ? rRes : rRes?.data || []);
      setFines(Array.isArray(fRes) ? fRes : fRes?.data || []);
      setEbooks(Array.isArray(eRes) ? eRes : eRes?.data || []);
    } catch (err) {
      // Backend might return 404 for certain endpoints if not fully mapped, gracefully ignore
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeIssued = circulations.filter((c) => c.status === "issued" || c.status === "overdue");
  const overdueCount = circulations.filter((c) => c.status === "overdue").length;
  const unpaidFines = fines.filter((f) => f.status === "unpaid").reduce((sum, f) => sum + (f.amount || 0), 0);
  
  const filteredBooks = books.filter(
    (b) =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="My Library" subtitle="Search books, view your issued items, and access e-books" />
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Currently Issued" value={String(activeIssued.length)} icon={BookMarked} tone="info" />
        <StatCard label="Overdue Books" value={String(overdueCount)} icon={Clock} tone={overdueCount > 0 ? "warning" : "success"} />
        <StatCard label="Active Reservations" value={String(reservations.length)} icon={BookmarkPlus} tone="primary" />
        <StatCard label="Pending Fines" value={`$${unpaidFines.toFixed(2)}`} icon={BookOpen} tone={unpaidFines > 0 ? "destructive" : "success"} />
      </div>

      <div className="flex overflow-x-auto gap-1 mb-4 rounded-lg bg-muted p-1">
        {(
          [
            ["catalog", "Search Catalog"],
            ["issued", "My Books"],
            ["reservations", "Reservations"],
            ["ebooks", "E-Books"],
            ["fines", "Fines"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all ${tab === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "catalog" && (
        <Panel title="Library Catalog">
          <div className="mb-4 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author, or category…"
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((b) => (
              <div key={b.id} className="rounded-lg border border-border p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-base mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">by {b.author}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-muted px-2 py-1 rounded-md">{b.category}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded-md">Shelf: {b.shelf}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className={`text-sm font-medium ${(b.available_copies || 0) > 0 ? "text-success" : "text-destructive"}`}>
                    {(b.available_copies || 0) > 0 ? `${b.available_copies} Available` : "Out of Stock"}
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        // Assuming the student's ID is retrieved from their auth context on the backend
                        await apiClient("/library/reservations", { 
                          method: "POST",
                          data: { bookId: b.id }
                        });
                        toast.success("Reservation placed successfully!");
                        fetchData();
                      } catch (err) {
                        toast.error("Failed to reserve book");
                      }
                    }}
                    className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-all"
                  >
                    Reserve
                  </button>
                </div>
              </div>
            ))}
            {filteredBooks.length === 0 && (
              <div className="col-span-full">
                <EmptyState icon={Search} title="No books found" description="Try adjusting your search query." />
              </div>
            )}
          </div>
        </Panel>
      )}

      {tab === "issued" && (
        <Panel title="Issued Books">
          <div className="space-y-4">
            {activeIssued.map((c) => (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div>
                  <h3 className="font-semibold">{c.book_title}</h3>
                  <p className="text-sm text-muted-foreground">Issued: {new Date(c.issued_date).toLocaleDateString()}</p>
                  <p className={`text-sm font-medium ${new Date(c.due_date) < new Date() ? "text-destructive" : ""}`}>
                    Due: {new Date(c.due_date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${c.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                  {c.status.toUpperCase()}
                </span>
              </div>
            ))}
            {activeIssued.length === 0 && (
              <EmptyState icon={BookMarked} title="No issued books" description="You currently have no books issued." />
            )}
          </div>
        </Panel>
      )}

      {tab === "reservations" && (
        <Panel title="My Reservations">
          <div className="space-y-4">
            {reservations.map((r) => (
              <div key={r._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div>
                  <h3 className="font-semibold">Book ID: {r.bookId}</h3>
                  <p className="text-sm text-muted-foreground">Reserved on: {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    {r.status?.toUpperCase() || 'PENDING'}
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        await apiClient(`/library/reservations/${r._id}/cancel`, { method: "POST" });
                        toast.success("Reservation cancelled");
                        fetchData();
                      } catch (err) {
                        toast.error("Failed to cancel reservation");
                      }
                    }}
                    className="text-xs text-destructive hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
            {reservations.length === 0 && (
              <EmptyState icon={BookmarkPlus} title="No reservations" description="You have no active book reservations." />
            )}
          </div>
        </Panel>
      )}

      {tab === "ebooks" && (
        <Panel title="E-Books & Digital Resources">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ebooks.map((e) => (
              <div key={e._id} className="rounded-lg border border-border p-4 flex flex-col">
                <h3 className="font-semibold mb-1">{e.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{e.category} · {e.subject}</p>
                <div className="mt-auto">
                  <a
                    href={e.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Download {e.fileType || 'PDF'}
                  </a>
                </div>
              </div>
            ))}
            {ebooks.length === 0 && (
              <div className="col-span-full">
                <EmptyState icon={Download} title="No E-Books available" description="Digital resources will appear here." />
              </div>
            )}
          </div>
        </Panel>
      )}

      {tab === "fines" && (
        <Panel title="Library Fines">
          <div className="space-y-4">
            {fines.map((f) => (
              <div key={f._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div>
                  <h3 className="font-semibold capitalize">{f.reason} Fine</h3>
                  <p className="text-sm text-muted-foreground">{f.remarks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Date: {new Date(f.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg mb-1">${f.amount?.toFixed(2)}</div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${f.status === "unpaid" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                    {f.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
            {fines.length === 0 && (
              <EmptyState icon={BookOpen} title="No fines" description="You have no library fines." />
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
