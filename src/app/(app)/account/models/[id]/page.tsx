"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { adminFetch } from "@/services/client/adminApi";
import { useSuperAdminGuard } from "@/hooks/useSuperAdminGuard";
import { RosterModel, RosterStatus, Shoot } from "@/types/model-types";
import accountStyles from "@/styles/account/Account.module.css";
import styles from "@/styles/account/AccountModels.module.css";

export default function AdminModelDetailPage() {
  const { allowed, checking } = useSuperAdminGuard();
  const params = useParams();
  const router = useRouter();
  const modelId = params.id as string;

  const [model, setModel] = useState<RosterModel | null>(null);
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
  const [sendingEmail, setSendingEmail] = useState(false);

  const loadModel = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminFetch<{ model: RosterModel; shoots: Shoot[] }>(
        `/api/admin/models/${modelId}`
      );
      setModel(data.model);
      setShoots(data.shoots);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load model.");
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    if (allowed) loadModel();
  }, [allowed, loadModel]);

  const updateField = <K extends keyof RosterModel>(
    key: K,
    value: RosterModel[K]
  ) => {
    setModel((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const toggleShoot = (shootId: string) => {
    if (!model) return;

    const next = model.shootIds.includes(shootId)
      ? model.shootIds.filter((id) => id !== shootId)
      : [...model.shootIds, shootId];

    updateField("shootIds", next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model) return;

    setSaving(true);
    setNotice(null);

    try {
      await adminFetch(`/api/admin/models/${modelId}`, {
        method: "PATCH",
        body: JSON.stringify({
          fullName: model.fullName,
          email: model.email,
          phone: model.phone ?? "",
          instagram: model.instagram ?? "",
          city: model.city ?? "",
          notes: model.notes ?? "",
          status: model.status,
          saved: model.saved,
          shootIds: model.shootIds,
        }),
      });
      setNotice("Changes saved.");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this model from the roster?")) return;

    try {
      await adminFetch(`/api/admin/models/${modelId}`, { method: "DELETE" });
      router.push("/account/models");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete model.");
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);
    setNotice(null);

    try {
      await adminFetch(`/api/admin/models/${modelId}/email`, {
        method: "POST",
        body: JSON.stringify(emailForm),
      });
      setEmailForm({ subject: "", message: "" });
      setNotice("Email sent.");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send email.");
    } finally {
      setSendingEmail(false);
    }
  };

  if (checking) {
    return <div className={accountStyles.loading}>Loading...</div>;
  }

  if (loading) {
    return <div className={accountStyles.loading}>Loading model...</div>;
  }

  if (!model) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error || "Model not found."}</p>
        <Link href="/account/models" className={styles.backLink}>
          Back to models
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/account/models" className={styles.backLink}>
        ← Models
      </Link>

      <div className={styles.headerRow}>
        <h1 className={accountStyles.pageTitle}>{model.fullName}</h1>
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

      {model.photoUrls.length > 0 && (
        <div className={styles.photoGrid}>
          {model.photoUrls.map((url, index) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.photoLink}
            >
              <Image
                src={url}
                alt={`${model.fullName} photo ${index + 1}`}
                width={120}
                height={160}
                className={styles.photo}
                unoptimized
              />
            </a>
          ))}
        </div>
      )}

      <form className={styles.card} onSubmit={handleSave}>
        <h2 className={styles.cardTitle}>Details</h2>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.label}>Full name</span>
            <input
              className={styles.input}
              value={model.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              className={styles.input}
              type="email"
              value={model.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Phone</span>
            <input
              className={styles.input}
              value={model.phone ?? ""}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Instagram</span>
            <input
              className={styles.input}
              value={model.instagram ?? ""}
              onChange={(e) => updateField("instagram", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>City</span>
            <input
              className={styles.input}
              value={model.city ?? ""}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Status</span>
            <select
              className={styles.input}
              value={model.status}
              onChange={(e) =>
                updateField("status", e.target.value as RosterStatus)
              }
            >
              <option value="active">Currently working</option>
              <option value="past">Past shoots</option>
            </select>
          </label>
        </div>

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={model.saved}
            onChange={(e) => updateField("saved", e.target.checked)}
          />
          <span>Saved</span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Notes</span>
          <textarea
            className={styles.textarea}
            rows={4}
            value={model.notes ?? ""}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span className={styles.label}>Linked shoots</span>
          {shoots.length === 0 ? (
            <p className={styles.empty}>No shoots created yet.</p>
          ) : (
            <div className={styles.checkboxList}>
              {shoots.map((shoot) => (
                <label key={shoot.id} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={model.shootIds.includes(shoot.id)}
                    onChange={() => toggleShoot(shoot.id)}
                  />
                  <span>
                    {shoot.title}{" "}
                    <span className={styles.itemMeta}>({shoot.status})</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button className={styles.primaryButton} type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <form className={styles.card} onSubmit={handleSendEmail}>
        <h2 className={styles.cardTitle}>Email {model.fullName}</h2>

        <label className={styles.field}>
          <span className={styles.label}>Subject</span>
          <input
            className={styles.input}
            value={emailForm.subject}
            onChange={(e) =>
              setEmailForm({ ...emailForm, subject: e.target.value })
            }
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Message</span>
          <textarea
            className={styles.textarea}
            rows={5}
            value={emailForm.message}
            onChange={(e) =>
              setEmailForm({ ...emailForm, message: e.target.value })
            }
            required
          />
        </label>

        <button
          className={styles.primaryButton}
          type="submit"
          disabled={sendingEmail}
        >
          {sendingEmail ? "Sending..." : "Send email"}
        </button>
      </form>
    </div>
  );
}
