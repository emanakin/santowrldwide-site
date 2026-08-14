"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { adminFetch } from "@/services/client/adminApi";
import { useSuperAdminGuard } from "@/hooks/useSuperAdminGuard";
import {
  APPLICATION_STATUSES,
  ApplicationStatus,
  ModelApplication,
  SHOOT_STATUSES,
  Shoot,
  ShootStatus,
} from "@/types/model-types";
import accountStyles from "@/styles/account/Account.module.css";
import styles from "@/styles/account/AccountModels.module.css";

const PIPELINE: { id: ApplicationStatus; label: string }[] = [
  { id: "applied", label: "Applied" },
  { id: "interviewed", label: "Interviewed" },
  { id: "selected", label: "Selected" },
  { id: "rejected", label: "Rejected" },
];

export default function AdminShootDetailPage() {
  const { allowed, checking } = useSuperAdminGuard();
  const params = useParams();
  const router = useRouter();
  const shootId = params.id as string;

  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [applications, setApplications] = useState<ModelApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadShoot = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminFetch<{
        shoot: Shoot;
        applications: ModelApplication[];
      }>(`/api/admin/shoots/${shootId}`);
      setShoot(data.shoot);
      setApplications(data.applications);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load shoot.");
    } finally {
      setLoading(false);
    }
  }, [shootId]);

  useEffect(() => {
    if (allowed) loadShoot();
  }, [allowed, loadShoot]);

  const updateField = <K extends keyof Shoot>(key: K, value: Shoot[K]) => {
    setShoot((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shoot) return;

    setSaving(true);
    setNotice(null);

    try {
      const data = await adminFetch<{ shoot: Shoot }>(
        `/api/admin/shoots/${shootId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title: shoot.title,
            description: shoot.description,
            category: shoot.category,
            location: shoot.location ?? "",
            shootDate: shoot.shootDate ?? "",
            status: shoot.status,
            youtubeUrl: shoot.youtubeUrl ?? "",
            highlightOnPublic: shoot.highlightOnPublic ?? false,
          }),
        }
      );
      setShoot(data.shoot);
      setNotice("Changes saved.");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save shoot.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this shoot? Applications will remain.")) return;

    try {
      await adminFetch(`/api/admin/shoots/${shootId}`, { method: "DELETE" });
      router.push("/account/models/shoots");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete shoot.");
    }
  };

  const setApplicationStatus = async (
    application: ModelApplication,
    status: ApplicationStatus
  ) => {
    try {
      const data = await adminFetch<{ application: ModelApplication }>(
        `/api/admin/applications/${application.id}`,
        { method: "PATCH", body: JSON.stringify({ status }) }
      );
      setApplications((prev) =>
        prev.map((a) => (a.id === application.id ? data.application : a))
      );
      setNotice(
        status === "selected"
          ? `${application.fullName} added to the roster.`
          : null
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update application."
      );
    }
  };

  if (checking) {
    return <div className={accountStyles.loading}>Loading...</div>;
  }

  if (loading) {
    return <div className={accountStyles.loading}>Loading shoot...</div>;
  }

  if (!shoot) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error || "Shoot not found."}</p>
        <Link href="/account/models/shoots" className={styles.backLink}>
          Back to shoots
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/account/models/shoots" className={styles.backLink}>
        ← Shoots
      </Link>

      <div className={styles.headerRow}>
        <h1 className={accountStyles.pageTitle}>{shoot.title}</h1>
        <button
          type="button"
          className={styles.dangerButton}
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {notice && <p className={styles.notice}>{notice}</p>}

      <form className={styles.card} onSubmit={handleSave}>
        <h2 className={styles.cardTitle}>Shoot details</h2>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.label}>Title</span>
            <input
              className={styles.input}
              value={shoot.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Category</span>
            <input
              className={styles.input}
              value={shoot.category}
              onChange={(e) => updateField("category", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Location</span>
            <input
              className={styles.input}
              value={shoot.location ?? ""}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Shoot date</span>
            <input
              className={styles.input}
              type="date"
              value={shoot.shootDate ?? ""}
              onChange={(e) => updateField("shootDate", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Status</span>
            <select
              className={styles.input}
              value={shoot.status}
              onChange={(e) =>
                updateField("status", e.target.value as ShootStatus)
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
              value={shoot.youtubeUrl ?? ""}
              onChange={(e) => updateField("youtubeUrl", e.target.value)}
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Description</span>
          <textarea
            className={styles.textarea}
            rows={4}
            value={shoot.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </label>

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={shoot.highlightOnPublic ?? false}
            onChange={(e) => updateField("highlightOnPublic", e.target.checked)}
          />
          <span>Highlight on the public models page (completed shoots)</span>
        </label>

        <p className={styles.itemMeta}>Public link: /models/{shoot.slug}</p>

        <button
          className={styles.primaryButton}
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          Applications ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <p className={styles.empty}>No applications yet.</p>
        ) : (
          <div className={styles.applicationList}>
            {applications.map((application) => (
              <article key={application.id} className={styles.application}>
                <div className={styles.listMain}>
                  <span className={styles.itemTitle}>
                    {application.fullName}
                  </span>
                  <span className={styles.itemMeta}>
                    {[
                      application.email,
                      application.city,
                      application.instagram,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  {application.note && (
                    <p className={styles.applicationNote}>{application.note}</p>
                  )}
                </div>

                {application.photoUrls.length > 0 && (
                  <div className={styles.photoGrid}>
                    {application.photoUrls.map((url, index) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.photoLink}
                      >
                        <Image
                          src={url}
                          alt={`${application.fullName} photo ${index + 1}`}
                          width={90}
                          height={120}
                          className={styles.photo}
                          unoptimized
                        />
                      </a>
                    ))}
                  </div>
                )}

                <div className={styles.pipelineRow}>
                  {PIPELINE.map((stage) => (
                    <button
                      key={stage.id}
                      type="button"
                      className={`${styles.pipelineButton} ${
                        application.status === stage.id
                          ? styles.pipelineButtonActive
                          : ""
                      }`}
                      onClick={() => setApplicationStatus(application, stage.id)}
                      disabled={application.status === stage.id}
                    >
                      {stage.label}
                    </button>
                  ))}

                  {application.modelId && (
                    <Link
                      href={`/account/models/${application.modelId}`}
                      className={styles.secondaryButton}
                    >
                      Open roster profile
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <p className={styles.itemMeta}>
          Pipeline stages: {APPLICATION_STATUSES.join(" → ")}
        </p>
      </section>
    </div>
  );
}
