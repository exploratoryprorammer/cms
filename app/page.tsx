"use client";
import React, { useState, useCallback } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Card,
  CardMedia,
  CardActions,
  Fade,
  Slide,
  CircularProgress,
  Divider,
  Stack,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  Send,
  RestartAlt,
  Image as ImageIcon,
  CheckCircle,
  Article,
} from "@mui/icons-material";

export default function Home() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setImages((prev) => [...prev, ...arr]);
    const urls = arr.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setTitle("");
    setBody("");
    setImages([]);
    setPreviews([]);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a title",
        severity: "error",
      });
      return;
    }

    setLoading(true);
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

      setSnackbar({
        open: true,
        message: "Content published successfully! 🎉",
        severity: "success",
      });
      handleReset();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Upload failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const charCount = body.length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 300,
                }}
              >
                Create beautiful content with ease
              </Typography>
            </Box>

            {/* Main Content Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 400px" },
                gap: 3,
              }}
            >
              {/* Editor Panel */}
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.98)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Article sx={{ mr: 1, color: "#667eea" }} />
                  <Typography variant="h5" fontWeight={700}>
                    Content Editor
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      variant="outlined"
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                          },
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Content"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      multiline
                      rows={12}
                      variant="outlined"
                      placeholder="Write your content here..."
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                          },
                        },
                      }}
                    />

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <Chip
                        icon={<Article />}
                        label={`${wordCount} words`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${charCount} characters`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Divider />

                    {/* Image Upload Area */}
                    <Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <ImageIcon sx={{ mr: 1, color: "#667eea" }} />
                        <Typography variant="h6" fontWeight={600}>
                          Images
                        </Typography>
                      </Box>

                      <Paper
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        sx={{
                          p: 4,
                          textAlign: "center",
                          border: "2px dashed",
                          borderColor: dragActive ? "#667eea" : "#e2e8f0",
                          borderRadius: 2,
                          bgcolor: dragActive
                            ? "rgba(102, 126, 234, 0.05)"
                            : "transparent",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          "&:hover": {
                            borderColor: "#667eea",
                            bgcolor: "rgba(102, 126, 234, 0.02)",
                          },
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFiles(e.target.files)}
                          style={{ display: "none" }}
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          style={{ cursor: "pointer" }}
                        >
                          <CloudUpload
                            sx={{ fontSize: 48, color: "#667eea", mb: 1 }}
                          />
                          <Typography
                            variant="body1"
                            fontWeight={600}
                            gutterBottom
                          >
                            Drag & drop images here
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            or click to browse
                          </Typography>
                        </label>
                      </Paper>

                      {/* Image Previews */}
                      {previews.length > 0 && (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(120px, 1fr))",
                            gap: 2,
                            mt: 3,
                          }}
                        >
                          {previews.map((p, i) => (
                            <Slide
                              key={i}
                              direction="up"
                              in
                              timeout={300 + i * 100}
                            >
                              <Card
                                sx={{
                                  position: "relative",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  "&:hover .delete-btn": {
                                    opacity: 1,
                                  },
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  height="120"
                                  image={p}
                                  alt={`preview-${i}`}
                                  sx={{ objectFit: "cover" }}
                                />
                                <CardActions
                                  className="delete-btn"
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    opacity: 0,
                                    transition: "opacity 0.2s",
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() => removeImage(i)}
                                    sx={{
                                      bgcolor: "rgba(255,255,255,0.9)",
                                      "&:hover": {
                                        bgcolor: "#ef4444",
                                        color: "white",
                                      },
                                    }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </CardActions>
                              </Card>
                            </Slide>
                          ))}
                        </Box>
                      )}
                    </Box>

                    <Divider />

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={
                          loading ? <CircularProgress size={20} /> : <Send />
                        }
                        sx={{
                          flex: 1,
                          py: 1.5,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          fontWeight: 600,
                          textTransform: "none",
                          fontSize: "1rem",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                          },
                        }}
                      >
                        {loading ? "Publishing..." : "Publish Content"}
                      </Button>
                      <Button
                        type="button"
                        variant="outlined"
                        size="large"
                        onClick={handleReset}
                        disabled={loading}
                        startIcon={<RestartAlt />}
                        sx={{
                          borderColor: "#667eea",
                          color: "#667eea",
                          fontWeight: 600,
                          textTransform: "none",
                          "&:hover": {
                            borderColor: "#5568d3",
                            bgcolor: "rgba(102, 126, 234, 0.05)",
                          },
                        }}
                      >
                        Reset
                      </Button>
                    </Box>
                  </Stack>
                </form>
              </Paper>

              {/* Preview Panel */}
              <Slide direction="left" in timeout={1000}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.98)",
                    backdropFilter: "blur(10px)",
                    height: "fit-content",
                    position: { lg: "sticky" },
                    top: { lg: 20 },
                  }}
                >
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    📝 Live Preview
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {title || body || previews.length > 0 ? (
                    <Box>
                      {title && (
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          {title}
                        </Typography>
                      )}
                      {body && (
                        <Typography
                          variant="body1"
                          sx={{
                            whiteSpace: "pre-wrap",
                            color: "text.secondary",
                            lineHeight: 1.7,
                            mb: 2,
                          }}
                        >
                          {body}
                        </Typography>
                      )}
                      {previews.length > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            mt: 2,
                          }}
                        >
                          {previews.map((p, i) => (
                            <Box
                              key={i}
                              component="img"
                              src={p}
                              alt={`preview-${i}`}
                              sx={{
                                width: "100%",
                                borderRadius: 2,
                                boxShadow: 2,
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 6,
                        color: "text.secondary",
                      }}
                    >
                      <Typography variant="body2">
                        Your content preview will appear here
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Slide>
            </Box>
          </Box>
        </Fade>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
          icon={snackbar.severity === "success" ? <CheckCircle /> : undefined}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
