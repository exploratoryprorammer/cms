'use client'
import React, { useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    setImages(arr);
    const urls = arr.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Uploading...");
    const form = new FormData();
    form.append("title", title);
    form.append("body", body);
    images.forEach((img) => form.append("images", img));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setStatus("Upload successful");
      // clear form
      setTitle("");
      setBody("");
      setImages([]);
      setPreviews([]);
    } catch (err: any) {
      setStatus(String(err.message || err));
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "Inter, Roboto, sans-serif" }}>
      <h1>Simple CMS Editor</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 12, maxWidth: 800 }}
      >
        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          Body
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {previews.map((p, i) => (
            <img
              key={i}
              src={p}
              alt={`preview-${i}`}
              style={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{ padding: "8px 16px" }}>
            Publish
          </button>
          <button
            type="button"
            onClick={() => {
              setTitle("");
              setBody("");
              setImages([]);
              setPreviews([]);
            }}
            style={{ padding: "8px 16px" }}
          >
            Reset
          </button>
        </div>

        {status && <div aria-live="polite">{status}</div>}
      </form>
    </main>
  );
}
