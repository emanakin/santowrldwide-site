"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/services/client/adminApi";
import { useSuperAdminGuard } from "@/hooks/useSuperAdminGuard";
import { SHOOT_STATUSES, Shoot, ShootStatus } from "@/types/model-types";
import accountStyles from "@/styles/account/Account.module.css";
import styles from "@/styles/account/AccountModels.module.css";

const EMPTY_SHOOT = {
  title: "",
  description: "",
  category: "music-video",
  location: "",
  shootDate: "",
  status: "draft" as ShootStatus,
  youtubeUrl: "",
  highlightOnPublic: false,
};

export default function AdminShootsPage() {
  const { allowed, checking } = useSuperAdminGuard();
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_SHOOT);
  const [saving, setSaving] = useState(false);

  const loadShoots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminFetch<{ shoots: Shoot[] }>("/api/admin/shoots");
      setShoots(data.shoots);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load shoots.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (allowed) loadShoots();
  }, [allowed, loadShoots]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await adminFetch("/api/admin/shoots", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(EMPTY_SHOOT);
      setShowForm(false);
      await loadShoots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create shoot.");
    } finally {
      setSaving(false);
    }
  };

  const toggleApplications = async (shoot: Shoot) => {
    const nextStatus: ShootStatus = shoot.status === "open" ? "closed" : "open";

    try {
      await adminFetch(`/api/admin/shoots/${shoot.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setShoots((prev) =>
        prev.map((s) => (s.id === shoot.id ? { ...s, status: nextStatus } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update shoot.");
    }
  };

  if (checking) {
    return <div className={accountStyles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={accountStyles.pageTitle}>Shoots</h1>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Cancel" : "New shoot"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {showForm && (
        <form className={styles.card} onSubmit={handleCreate}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Title *</span>
              <input
                className={styles.input}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Category</span>
              <input
                className={styles.input}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="music-video"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Location</span>
              <input
                className={styles.input}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Shoot date</span>
              <input
                className={styles.input}
                type="date"
                value={form.shootDate}
                onChange={(e) => setForm({ ...form, shootDate: e.target.value })}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Status</span>
              <select
                className={styles.input}
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ShootStatus })
                }
              >
                {SHOOT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>YouTube URL</span>
              <input
                className={styles.input}
                value={form.youtubeUrl}
                onChange={(e) =>
                  setForm({ ...form, youtubeUrl: e.target.value })
                }
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Description</span>
            <textarea
              className={styles.textarea}
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={form.highlightOnPublic}
              onChange={(e) =>
                setForm({ ...form, highlightOnPublic: e.target.checked })
              }
            />
            <span>Highlight on the public models page (completed shoots)</span>
          </label>

          <button
            className={styles.primaryButton}
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Create shoot"}
          </button>
        </form>
      )}

      {loading ? (
        <div className={accountStyles.loading}>Loading shoots...</div>
      ) : shoots.length === 0 ? (
        <p className={styles.empty}>No shoots yet. Create your first one.</p>
      ) : (
        <ul className={styles.list}>
          {shoots.map((shoot) => (
            <li key={shoot.id} className={styles.listItem}>
              <div className={styles.listMain}>
                <Link
                  href={`/account/models/shoots/${shoot.id}`}
                  className={styles.itemTitle}
                >
                  {shoot.title}
                </Link>
                <span className={styles.itemMeta}>
                  {[shoot.category, shoot.location, shoot.shootDate]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>

              <div className={styles.listActions}>
                <span className={styles.badge}>{shoot.status}</span>
                {shoot.highlightOnPublic && (
                  <span className={styles.badge}>highlighted</span>
                )}
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => toggleApplications(shoot)}
                >
                  {shoot.status === "open" ? "Close" : "Open"} applications
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
