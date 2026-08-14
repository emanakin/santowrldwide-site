"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import BackgroundVideo from "@/components/video/BackgroundVideo";
import { VIDEOS } from "@/lib/media";
import {
  MAX_APPLICATION_PHOTOS,
  MAX_PHOTO_BYTES,
  Shoot,
} from "@/types/model-types";
import styles from "@/styles/models/Models.module.css";

interface ApplyFormState {
  fullName: string;
  email: string;
  phone: string;
  instagram: string;
  city: string;
  note: string;
}

const EMPTY_FORM: ApplyFormState = {
  fullName: "",
  email: "",
  phone: "",
  instagram: "",
  city: "",
  note: "",
};

export default function ModelApplyPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ApplyFormState>(EMPTY_FORM);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    const loadShoot = async () => {
      try {
        const response = await fetch(`/api/models/shoots/${slug}`);
        const data = await response.json();

        if (cancelled) return;
        if (response.ok) setShoot(data.shoot);
      } catch (error) {
        console.error("Error loading shoot:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadShoot();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Object URLs must be released when the selection changes
  useEffect(() => {
    const urls = photos.map((photo) => URL.createObjectURL(photo));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (status.type) setStatus({ type: null, message: "" });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);

    if (selected.length > MAX_APPLICATION_PHOTOS) {
      setStatus({
        type: "error",
        message: `Please choose up to ${MAX_APPLICATION_PHOTOS} photos.`,
      });
      return;
    }

    const oversized = selected.find((file) => file.size > MAX_PHOTO_BYTES);
    if (oversized) {
      setStatus({
        type: "error",
        message: `${oversized.name} is larger than 8MB.`,
      });
      return;
    }

    setStatus({ type: null, message: "" });
    setPhotos(selected);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length === 0) {
      setStatus({ type: "error", message: "Please attach at least one photo." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const payload = new FormData();
      payload.append("shootSlug", slug);
      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, value);
      });
      photos.forEach((photo) => payload.append("photos", photo));

      const response = await fetch("/api/models/apply", {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: data.message || "Application received.",
        });
        setForm(EMPTY_FORM);
        setPhotos([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to submit. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <BackgroundVideo src={VIDEOS.feelAlive} overlayOpacity={0.78} />

      <div className={styles.content}>
        <div className={styles.topBar}>
          <Link href="/" className={styles.wordmark}>
            SANTOWRLDWIDE
          </Link>
          <Link href="/models" className={styles.backLink}>
            ← all castings
          </Link>
        </div>

        {loading ? (
          <p className={styles.quiet}>loading...</p>
        ) : !shoot ? (
          <p className={styles.quiet}>this casting is no longer available</p>
        ) : (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>{shoot.title}</h1>
              <p className={styles.subtitle}>
                {[shoot.category, shoot.location, shoot.shootDate]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {shoot.description && (
                <p className={styles.description}>{shoot.description}</p>
              )}
            </header>

            {shoot.status !== "open" ? (
              <p className={styles.quiet}>
                applications for this shoot are closed
              </p>
            ) : status.type === "success" ? (
              <div className={styles.successBox}>
                <p>{status.message}</p>
                <Link href="/models" className={styles.backLink}>
                  back to castings
                </Link>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span className={styles.label}>full name *</span>
                    <input
                      className={styles.input}
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>email *</span>
                    <input
                      className={styles.input}
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>phone</span>
                    <input
                      className={styles.input}
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>instagram</span>
                    <input
                      className={styles.input}
                      name="instagram"
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="@handle"
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>city</span>
                    <input
                      className={styles.input}
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                <label className={styles.field}>
                  <span className={styles.label}>anything else</span>
                  <textarea
                    className={styles.textarea}
                    name="note"
                    rows={4}
                    value={form.note}
                    onChange={handleChange}
                  />
                </label>

                <div className={styles.field}>
                  <span className={styles.label}>
                    photos * (up to {MAX_APPLICATION_PHOTOS}, 8MB each)
                  </span>
                  <input
                    ref={fileInputRef}
                    className={styles.fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    multiple
                    onChange={handlePhotoChange}
                  />

                  {previews.length > 0 && (
                    <div className={styles.previewGrid}>
                      {previews.map((preview, index) => (
                        <div key={preview} className={styles.previewItem}>
                          {/* Local object URLs can't go through next/image */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt={`Selected photo ${index + 1}`}
                            className={styles.previewImage}
                          />
                          <button
                            type="button"
                            className={styles.previewRemove}
                            onClick={() => removePhoto(index)}
                            aria-label="Remove photo"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {status.type === "error" && (
                  <p className={styles.errorMessage}>{status.message}</p>
                )}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "submitting..." : "submit application"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
