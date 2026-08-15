"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { adminFetch } from "@/services/client/adminApi";
import { useSuperAdminGuard } from "@/hooks/useSuperAdminGuard";
import {
  APPLICATION_STATUSES,
  ApplicationStatus,
  ModelApplication,
  Shoot,
} from "@/types/model-types";
import accountStyles from "@/styles/account/Account.module.css";
import styles from "@/styles/account/AccountModels.module.css";

export default function AdminApplicationDetailPage() {
  const { allowed, checking } = useSuperAdminGuard();
  const params = useParams();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<ModelApplication | null>(null);
  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadApplication = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminFetch<{
        application: ModelApplication;
        shoot: Shoot | null;
      }>(`/api/admin/applications/${applicationId}`);
      setApplication(data.application);
      setShoot(data.shoot);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load application."
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (allowed) loadApplication();
  }, [allowed, loadApplication]);

  const addToRoster = async () => {
    if (!application) return;
    setAdding(true);
    setNotice(null);

    try {
      const data = await adminFetch<{
        application: ModelApplication;
        modelId?: string;
      }>(`/api/admin/applications/${application.id}`, {
        method: "PATCH",
        body: JSON.stringify({ addToRoster: true }),
      });
      setApplication(data.application);
      setNotice(`${application.fullName} added to the roster.`);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add this model."
      );
    } finally {
      setAdding(false);
    }
  };

  const setStatus = async (status: ApplicationStatus) => {
    if (!application) return;

    try {
      const data = await adminFetch<{ application: ModelApplication }>(
        `/api/admin/applications/${application.id}`,
        { method: "PATCH", body: JSON.stringify({ status }) }
      );
      setApplication(data.application);
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
    return <div className={accountStyles.loading}>Loading application...</div>;
  }

  if (!application) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error || "Application not found."}</p>
        <Link href="/account/models" className={styles.backLink}>
          Back to models
        </Link>
      </div>
    );
  }

  const alreadyOnRoster = Boolean(application.modelId);

  return (
    <div className={styles.container}>
      <Link
        href={
          shoot
            ? `/account/models/shoots/${shoot.id}`
            : "/account/models"
        }
        className={styles.backLink}
      >
        ← {shoot ? shoot.title : "Models"}
      </Link>

      <div className={styles.headerRow}>
        <h1 className={accountStyles.pageTitle}>{application.fullName}</h1>
        {alreadyOnRoster ? (
          <Link
            href={`/account/models/${application.modelId}`}
            className={styles.secondaryButton}
          >
            Open roster profile
          </Link>
        ) : (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={addToRoster}
            disabled={adding}
          >
            {adding ? "Adding..." : "Add to models"}
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {notice && <p className={styles.notice}>{notice}</p>}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Contact</h2>
        <dl className={styles.detailList}>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${application.email}`}>{application.email}</a>
            </dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              {application.phone ? (
                <a href={`tel:${application.phone}`}>{application.phone}</a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt>Instagram</dt>
            <dd>{application.instagram || "—"}</dd>
          </div>
          <div>
            <dt>City</dt>
            <dd>{application.city || "—"}</dd>
          </div>
          <div>
            <dt>Shoot</dt>
            <dd>
              {shoot ? (
                <Link href={`/account/models/shoots/${shoot.id}`}>
                  {shoot.title}
                </Link>
              ) : (
                application.shootTitle || "—"
              )}
            </dd>
          </div>
          <div>
            <dt>Applied</dt>
            <dd>{new Date(application.createdAt).toLocaleString()}</dd>
          </div>
        </dl>

        {application.note && (
          <div className={styles.field}>
            <span className={styles.label}>Note</span>
            <p className={styles.applicationNote}>{application.note}</p>
          </div>
        )}
      </section>

      {application.photoUrls.length > 0 && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Photos</h2>
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
                  width={160}
                  height={210}
                  className={styles.photoLarge}
                  unoptimized
                />
              </a>
            ))}
          </div>
        </section>
      )}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Status</h2>
        <div className={styles.pipelineRow}>
          {APPLICATION_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={`${styles.pipelineButton} ${
                application.status === status
                  ? styles.pipelineButtonActive
                  : ""
              }`}
              onClick={() => setStatus(status)}
              disabled={application.status === status}
            >
              {status}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
