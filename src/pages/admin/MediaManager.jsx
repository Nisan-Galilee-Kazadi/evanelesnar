import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import AdminLayout from "../../components/AdminLayout";
import { API } from "../../utils/api";
import { FaPlus, FaTrash, FaPhotoVideo, FaLink, FaFolderOpen, FaUpload, FaCut } from "react-icons/fa";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const MediaManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [isDraggingUrl, setIsDraggingUrl] = useState(false);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const [showTrimModal, setShowTrimModal] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpeg, setFfmpeg] = useState(null);
  const [trimming, setTrimming] = useState(false);

  const [form, setForm] = useState({
    type: "image",
    destination: "gallery",
    url: "",
    title: "",
    description: "",
    category: "other",
    thumbnail: "",
    sourceEvent: "",
  });

  const token = localStorage.getItem("token");

  // Init FFmpeg.wasm
  const initFFmpeg = async () => {
    if (ffmpegLoaded) return ffmpeg;
    const ffmpegInstance = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    setFfmpeg(ffmpegInstance);
    setFfmpegLoaded(true);
    return ffmpegInstance;
  };

  const extractUrlFromDrop = (e) => {
    const uriList = e.dataTransfer.getData("text/uri-list");
    const plain = e.dataTransfer.getData("text/plain");
    const candidate = (uriList || plain || "").trim();
    if (!candidate) return "";
    if (candidate.startsWith("http://") || candidate.startsWith("https://")) return candidate;
    return "";
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Impossible de lire le fichier"));
      reader.readAsDataURL(file);
    });

  const handlePickFile = async (target) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = target === "thumbnail" ? "image/*" : "image/*,video/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Si c'est une vidéo, proposer de la trimmer
      if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoUrl(url);
        const video = document.createElement("video");
        video.src = url;
        video.onloadedmetadata = () => {
          const duration = video.duration;
          setTrimStart(0);
          setTrimEnd(duration);
          setShowTrimModal(true);
        };
        video.onerror = () => {
          Swal.fire({
            icon: "error",
            title: "Erreur vidéo",
            text: "Impossible de lire cette vidéo.",
            confirmButtonColor: "#dc2626",
          });
        };
        return;
      }

      // Image : upload direct
      try {
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("token");
        const uploadRes = await fetch(API("/api/media/upload"), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

        const createPayload = {
          type: "image",
          destination: form.destination,
          url: uploadData.url,
          title: form.title || file.name,
          description: form.description,
          category: form.category,
          sourceEvent: form.sourceEvent,
        };

        const createRes = await fetch(API("/api/media"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(createPayload),
        });
        const created = await createRes.json();
        if (!createRes.ok) throw new Error(created.error || "Create failed");

        await Swal.fire({
          icon: "success",
          title: "Média ajouté",
          text: "Fichier uploadé et média créé avec succès.",
          confirmButtonColor: "#dc2626",
        });

        fetchMedia();
        setForm({
          type: "image",
          destination: "gallery",
          url: "",
          title: "",
          description: "",
          category: "other",
          thumbnail: "",
          sourceEvent: "",
        });
      } catch (err) {
        console.error(err);
        await Swal.fire({
          icon: "error",
          title: "Erreur",
          text: err.message || "Impossible d’ajouter ce média.",
          confirmButtonColor: "#dc2626",
        });
      }
    };

    input.click();
  };

  const handleTrimAndUpload = async () => {
    if (!videoFile) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Aucune vidéo sélectionnée.",
        confirmButtonColor: "#dc2626",
      });
      return;
    }
    setTrimming(true);
    try {
      let ffmpegInstance = ffmpeg;
      if (!ffmpegLoaded) {
        console.log("FFmpeg non chargé, initialisation...");
        ffmpegInstance = await initFFmpeg();
      }
      console.log("FFmpeg prêt, début du trim...");
      const inputName = "input.mp4";
      const outputName = "output.mp4";
      await ffmpegInstance.writeFile(inputName, await fetchFile(videoFile));
      await ffmpegInstance.exec([
        "-i",
        inputName,
        "-ss",
        trimStart.toString(),
        "-t",
        (trimEnd - trimStart).toString(),
        "-c",
        "copy",
        outputName,
      ]);
      const data = await ffmpegInstance.readFile(outputName);
      const trimmedBlob = new Blob([data.buffer], { type: "video/mp4" });
      console.log("Trim terminé, upload...");
      const formData = new FormData();
      formData.append("file", trimmedBlob, "trimmed.mp4");
      const token = localStorage.getItem("token");
      const uploadRes = await fetch(API("/api/media/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      const createPayload = {
        type: "video",
        destination: form.destination,
        url: uploadData.url,
        title: form.title || videoFile.name,
        description: form.description,
        category: form.category,
        thumbnail: form.thumbnail || uploadData.url.replace(/\.(mp4|webm|ogg)$/, ".jpg"),
        sourceEvent: form.sourceEvent,
      };

      const createRes = await fetch(API("/api/media"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createPayload),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error || "Create failed");

      await Swal.fire({
        icon: "success",
        title: "Vidéo ajoutée",
        text: "Extrait uploadé et média créé avec succès.",
        confirmButtonColor: "#dc2626",
      });

      setShowTrimModal(false);
      setVideoFile(null);
      setVideoUrl("");
      setTrimStart(0);
      setTrimEnd(0);
      fetchMedia();
      setForm({
        type: "image",
        destination: "gallery",
        url: "",
        title: "",
        description: "",
        category: "other",
        thumbnail: "",
        sourceEvent: "",
      });
    } catch (err) {
      console.error("Erreur trim/upload:", err);
      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err.message || "Impossible de trimmer/uploader la vidéo.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setTrimming(false);
    }
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(API("/api/media"));
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de charger les médias",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Précharger FFmpeg au montage pour éviter le délai
    initFFmpeg().catch(() => {});
  }, []);

  useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(API("/api/events"));
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    };

    fetchEvents();
  }, []);

  const canSubmit = useMemo(() => {
    if (!form.url.trim()) return false;
    if (form.type === "video") {
      return !!form.thumbnail.trim();
    }
    return true;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      await Swal.fire({
        icon: "warning",
        title: "Champs requis",
        text:
          form.type === "video"
            ? "URL + Thumbnail requis pour une vidéo."
            : "URL requise.",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    try {
      const res = await fetch(API("/api/media"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: form.type,
          destination: form.destination,
          url: form.url.trim(),
          title: form.title.trim() || undefined,
          description: form.description.trim() || undefined,
          category: form.category,
          thumbnail: form.type === "video" ? form.thumbnail.trim() : undefined,
          sourceEvent: form.sourceEvent || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Erreur lors de l'ajout");
      }

      setForm({
        type: "image",
        destination: "gallery",
        url: "",
        title: "",
        description: "",
        category: "other",
        thumbnail: "",
        sourceEvent: "",
      });
      await Swal.fire({
        icon: "success",
        title: "Ajouté",
        text: "Média ajouté avec succès.",
        confirmButtonColor: "#dc2626",
      });
      await fetchMedia();
    } catch (e2) {
      console.error(e2);
      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: e2?.message || "Erreur serveur",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Supprimer ce média ?",
      text: "Cette action est définitive.",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(API(`/api/media/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Erreur lors de la suppression");
      }

      await Swal.fire({
        icon: "success",
        title: "Supprimé",
        text: "Média supprimé.",
        confirmButtonColor: "#dc2626",
      });

      await fetchMedia();
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: e?.message || "Erreur serveur",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="px-2">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FaPhotoVideo /> Gestion des Médias
          </h1>
          <p className="text-slate-400">Ajouter et supprimer des photos et vidéos (par URL).</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaPlus /> Ajouter un média
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-2">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-red-500 outline-none"
                >
                  <option value="image">Photo</option>
                  <option value="video">Vidéo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-2">Destination</label>
                <select
                  value={form.destination}
                  onChange={(e) => setForm((s) => ({ ...s, destination: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-red-500 outline-none"
                >
                  <option value="home">Extraits (Home)</option>
                  <option value="gallery">Galerie</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-2">Catégorie</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-red-500 outline-none"
                >
                  <option value="spectacle">Spectacle</option>
                  <option value="portrait">Portrait</option>
                  <option value="scene">Scène</option>
                  <option value="video">Vidéo</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-2">Événement lié (optionnel)</label>
                <select
                  value={form.sourceEvent}
                  onChange={(e) => setForm((s) => ({ ...s, sourceEvent: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-red-500 outline-none"
                >
                  <option value="">Aucun</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-2">Titre (optionnel)</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-red-500 outline-none"
                placeholder="Titre du média"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-2">Description (optionnelle)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-red-500 outline-none"
                rows={3}
                placeholder="Description du média"
              />
            </div>

            <div className="flex items-center justify-center py-8">
              <button
                type="button"
                onClick={() => handlePickFile("url")}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-lg flex items-center gap-3 transition-colors"
              >
                <FaFolderOpen size={20} />
                Choisir un fichier (image ou vidéo)
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Médias existants</h2>

          {loading ? (
            <div className="text-slate-400">Chargement...</div>
          ) : items.length === 0 ? (
            <div className="text-slate-400">Aucun média.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((m) => (
                <div
                  key={m._id}
                  className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden"
                >
                  <div className="relative h-48">
                    {m.type === "image" ? (
                      <img
                        src={m.url}
                        alt={m.title || "media"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={m.thumbnail || ""}
                        alt={m.title || "video"}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-white font-semibold truncate">
                          {m.title || (m.type === "video" ? "Vidéo" : "Photo")}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {m.type.toUpperCase()} • {m.category}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(m._id)}
                        className="p-2 bg-slate-900 hover:bg-red-600 text-white rounded-lg transition-colors"
                        aria-label="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-red-400 text-sm underline block mt-3 truncate"
                    >
                      {m.url}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Trim Vidéo */}
      {showTrimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaCut /> Rogner la vidéo
            </h3>
            {videoUrl && (
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg bg-black"
                id="trim-video"
              />
            )}
            <div className="space-y-2">
              <label className="text-slate-400 text-sm">Début (secondes)</label>
              <input
                type="range"
                min={0}
                max={trimEnd || 100}
                step={0.1}
                value={trimStart}
                onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                className="w-full accent-red-600"
              />
              <div className="text-white text-sm">{trimStart.toFixed(1)}s</div>
            </div>
            <div className="space-y-2">
              <label className="text-slate-400 text-sm">Fin (secondes)</label>
              <input
                type="range"
                min={trimStart}
                max={trimEnd || 100}
                step={0.1}
                value={trimEnd}
                onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                className="w-full accent-red-600"
              />
              <div className="text-white text-sm">{trimEnd.toFixed(1)}s</div>
            </div>
            <div className="text-slate-400 text-sm">
              Durée sélectionnée : {(trimEnd - trimStart).toFixed(1)}s
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowTrimModal(false);
                  setVideoFile(null);
                  setVideoUrl("");
                  setTrimStart(0);
                  setTrimEnd(0);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleTrimAndUpload}
                disabled={trimming || !ffmpegLoaded}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {trimming ? "Traitement..." : ffmpegLoaded ? "Rogner et uploader" : "Chargement FFmpeg..."}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MediaManager;
