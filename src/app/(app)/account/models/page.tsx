"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/services/client/adminApi";
import { useSuperAdminGuard } from "@/hooks/useSuperAdminGuard";
import {
  ModelApplication,
  RosterModel,
  RosterStatus,
} from "@/types/model-types";
import accountStyles from "@/styles/account/Account.module.css";
import styles from "@/styles/account/AccountModels.module.css";

type RosterFilter = "all" | "active" | "past" | "saved";

const FILTERS: { id: RosterFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Currently working" },
  { id: "past", label: "Past shoots" },
  { id: "saved", label: "Saved" },
];

const EMPTY_NEW_MODEL = {
  fullName: "",
  email: "",
  phone: "",
  instagram: "",
  city: "",
  notes: "",
  status: "active" as RosterStatus,
};

export default function AdminModelsPage() {
  const { allowed, checking } = useSuperAdminGuard();
  const [models, setModels] = useState<RosterModel[]>([]);
  const [applications, setApplications] = useState<ModelApplication[]>([]);
  const [filter, setFilter] = useState<RosterFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newModel, setNewModel] = useState(EMPTY_NEW_MODEL);
  const [saving, setSaving] = useState(false);

  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      const [modelsData, applicationsData] = await Promise.all([
        adminFetch<{ models: RosterModel[] }>("/api/admin/models"),
        adminFetch<{ applications: ModelApplication[] }>(
          "/api/admin/applications"
        ),
      ]);
      setModels(modelsData.models);
      setApplications(applicationsData.applications);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load models.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (allowed) loadModels();
  }, [allowed, loadModels]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await adminFetch("/api/admin/models", {
        method: "POST",
        body: JSON.stringify(newModel),
      });
      setNewModel(EMPTY_NEW_MODEL);
      setShowForm(false);
      await loadModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create model.");
    } finally {
      setSaving(false);
    }
  };

  const addToRoster = async (application: ModelApplication) => {
    try {
      const data = await adminFetch<{ application: ModelApplication }>(
        `/api/admin/applications/${application.id}`,
        { method: "PATCH", body: JSON.stringify({ addToRoster: true }) }
      );
      setApplications((prev) =>
        prev.map((a) => (a.id === application.id ? data.application : a))
      );
      await loadModels();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add this model."
      );
    }
  };

  const toggleSaved = async (model: RosterModel) => {
    try {
      await adminFetch(`/api/admin/models/${model.id}`, {
        method: "PATCH",
        body: JSON.stringify({ saved: !model.saved }),
      });
      setModels((prev) =>
        prev.map((m) => (m.id === model.id ? { ...m, saved: !m.saved } : m))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update model.");
    }
  };

  const visibleModels = models.filter((model) => {
    if (filter === "saved") return model.saved;
    if (filter === "active") return model.status === "active";
    if (filter === "past") return model.status === "past";
    return true;
  });

  if (checking) {
    return <div className={accountStyles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={accountStyles.pageTitle}>Models</h1>
        <button
          className={styles.primaryButton}
          onClick={() => setShowForm((prev) => !prev)}
          type="button"
        >
          {showForm ? "Cancel" : "Add model"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {showForm && (
        <form className={styles.card} onSubmit={handleCreate}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Full name *</span>
              <input
                className={styles.input}
                value={newModel.fullName}
                onChange={(e) =>
                  setNewModel({ ...newModel, fullName: e.target.value })
                }
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Email *</span>
              <input
                className={styles.input}
                type="email"
                value={newModel.email}
                onChange={(e) =>
                  setNewModel({ ...newModel, email: e.target.value })
                }
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Phone</span>
              <input
                className={styles.input}
                value={newModel.phone}
                onChange={(e) =>
                  setNewModel({ ...newModel, phone: e.target.value })
                }
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Instagram</span>
              <input
                className={styles.input}
                value={newModel.instagram}
                onChange={(e) =>
                  setNewModel({ ...newModel, instagram: e.target.value })
                }
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>City</span>
              <input
                className={styles.input}
                value={newModel.city}
                onChange={(e) =>
                  setNewModel({ ...newModel, city: e.target.value })
                }
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Status</span>
              <select
                className={styles.input}
                value={newModel.status}
                onChange={(e) =>
                  setNewModel({
                    ...newModel,
                    status: e.target.value as RosterStatus,
                  })
                }
              >
                <option value="active">Currently working</option>
                <option value="past">Past shoots</option>
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Notes</span>
            <textarea
              className={styles.textarea}
              rows={3}
              value={newModel.notes}
              onChange={(e) =>
                setNewModel({ ...newModel, notes: e.target.value })
              }
            />
          </label>

          <button
            className={styles.primaryButton}
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save model"}
          </button>
        </form>
      )}

      {applications.length > 0 && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            Applications ({applications.length})
          </h2>
          <ul className={styles.list}>
            {applications.map((application) => (
              <li key={application.id} className={styles.listItem}>
                <div className={styles.listMain}>
                  <Link
                    href={`/account/models/applications/${application.id}`}
                    className={styles.itemTitle}
                  >
                    {application.fullName}
                  </Link>
                  <span className={styles.itemMeta}>
                    {[
                      application.phone,
                      application.email,
                      application.city,
                      application.shootTitle,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <div className={styles.listActions}>
                  <span className={styles.badge}>{application.status}</span>
                  {application.modelId ? (
                    <Link
                      href={`/account/models/${application.modelId}`}
                      className={styles.secondaryButton}
                    >
                      On roster
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => addToRoster(application)}
                    >
                      Add to models
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={styles.filterRow}>
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.filterButton} ${
              filter === item.id ? styles.filterButtonActive : ""
            }`}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={accountStyles.loading}>Loading models...</div>
      ) : visibleModels.length === 0 ? (
        <p className={styles.empty}>No models in this list yet.</p>
      ) : (
        <ul className={styles.list}>
          {visibleModels.map((model) => (
            <li key={model.id} className={styles.listItem}>
              <div className={styles.listMain}>
                <Link
                  href={`/account/models/${model.id}`}
                  className={styles.itemTitle}
                >
                  {model.fullName}
                </Link>
                <span className={styles.itemMeta}>
                  {[model.email, model.city].filter(Boolean).join(" · ")}
                </span>
              </div>

              <div className={styles.listActions}>
                <span className={styles.badge}>
                  {model.status === "active" ? "working" : "past"}
                </span>
                <span className={styles.badge}>
                  {model.shootIds.length} shoot
                  {model.shootIds.length === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => toggleSaved(model)}
                  aria-label={model.saved ? "Unsave model" : "Save model"}
                  title={model.saved ? "Saved" : "Save"}
                >
                  {model.saved ? "★" : "☆"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
