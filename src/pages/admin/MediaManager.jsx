import { useEffect, useState, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import AdminLayout from "../../components/AdminLayout";
import { API } from "../../utils/api";
import {
  FaPlus,
  FaTrash,
  FaPhotoVideo,
  FaFilter,
  FaCloudUploadAlt,
  FaCut,
  FaPlay,
  FaPause,
  FaCheck,
  FaTimes,
  FaImage,
  FaVideo,
  FaArrowRight,
  FaArrowLeft,
  FaSpinner
} from "react-icons/fa";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const MediaManager = () => {
  // --- STATE: DATA ---
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE: UI ---
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'gallery', 'home'
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1: Type, 2: File, 3: Trim (Video only), 4: Metadata, 5: Uploading

  // --- STATE: FORM / UPLOAD ---
  const [uploadType, setUploadType] = useState("image"); // 'image' or 'video'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "performance",
    destination: "gallery",
    sourceEvent: "",
  });

  // --- STATE: VIDEO TRIMMING ---
  const [ffmpeg, setFfmpeg] = useState(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegError, setFfmpegError] = useState(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);

  // --- INITIALIZATION ---
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMedia();
    fetchEvents();
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      const ffmpegInstance = new FFmpeg();
      // Switch to jsdelivr which is often more stable for WASM hosting
      const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      setFfmpeg(ffmpegInstance);
      setFfmpegLoaded(true);
    } catch (err) {
      console.error("FFmpeg load failed:", err);
      // Handle cases where err might not be an Error object
      const msg = err instanceof Error ? err.message : String(err);
      setFfmpegError(msg);
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await fetch(API("/api/media"));
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(API("/api/events"));
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // --- HANDLERS: MODAL FLOW ---
  const resetModal = () => {
    setShowModal(false);
    setModalStep(1);
    setUploadType("image");
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData({
      title: "",
      description: "",
      category: "performance",
      destination: "gallery",
      sourceEvent: "",
    });
    setTrimStart(0);
    setTrimEnd(10);
    setVideoDuration(0);
    setIsProcessing(false);
  };

  const openModal = () => {
    resetModal();
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation basic
    if (uploadType === "image" && !file.type.startsWith("image/")) {
      Swal.fire("Format invalide", "Veuillez sélectionner une image", "error");
      return;
    }
    if (uploadType === "video" && !file.type.startsWith("video/")) {
      Swal.fire("Format invalide", "Veuillez sélectionner une vidéo", "error");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Next step logic
    if (uploadType === "video") {
      setModalStep(3); // Go to Trim
    } else {
      setModalStep(4); // Go to Metadata
    }
  };

  // --- HANDLERS: VIDEO TRIMMING ---
  const onVideoLoadedMetadata = (e) => {
    const duration = e.target.duration;
    setVideoDuration(duration);
    setTrimEnd(duration);
    setTrimStart(0);
  };

  const handleProcessVideo = async () => {
    if (!selectedFile) return;

    if (!ffmpegLoaded || !ffmpeg) {
      Swal.fire({
        icon: 'error',
        title: 'FFmpeg non prêt',
        text: `Le moteur vidéo ne s'est pas chargé. Erreur: ${ffmpegError || 'Inconnue'}. Rafraîchissez la page.`,
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const inputName = "input.mp4";
      const outputName = "output.mp4";

      await ffmpeg.writeFile(inputName, await fetchFile(selectedFile));

      // FFmpeg command: Trim video
      await ffmpeg.exec([
        "-i", inputName,
        "-ss", trimStart.toString(),
        "-t", (trimEnd - trimStart).toString(),
        "-c", "copy", // Fast copy without transcoding
        outputName
      ]);

      const data = await ffmpeg.readFile(outputName);
      const trimmedBlob = new Blob([data.buffer], { type: "video/mp4" });
      const trimmedFile = new File([trimmedBlob], "trimmed.mp4", { type: "video/mp4" });

      setSelectedFile(trimmedFile); // Update selected file with trimmed version
      setModalStep(4); // Proceed to Metadata
    } catch (err) {
      console.error("Trim error:", err);
      Swal.fire("Erreur", "Le rognage a échoué", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- HANDLERS: UPLOAD ---
  const handleUpload = async () => {
    if (!selectedFile) return;
    setModalStep(5); // Show loading

    try {
      // 1. Upload File
      const uploadDataPayload = new FormData();
      uploadDataPayload.append("file", selectedFile);

      const uploadRes = await fetch(API("/api/media/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadDataPayload,
      });

      if (!uploadRes.ok) throw new Error("Erreur upload fichier");
      const { url } = await uploadRes.json();

      // 2. Generate Thumbnail (Client-side simple placeholder OR user uploaded?)
      // For now, if video, we might need a thumb. The old system reused the URL mostly or did magic.
      // Let's use a default or reuse the logic.
      let thumbnail = "";
      if (uploadType === "video") {
        thumbnail = url.replace(/\.(mp4|webm|ogg)$/i, ".jpg"); // Assuming backend or manual handle? 
        // Actually, let's just leave it empty if auto-gen isn't perfect, or use a placeholder.
        // Better: For this v2, we assume the user accepts the default video icon if no thumb.
      }

      // 3. Create Media Record
      const payload = {
        type: uploadType,
        destination: formData.destination,
        url: url,
        title: formData.title || selectedFile.name,
        description: formData.description,
        category: formData.category,
        sourceEvent: formData.sourceEvent || undefined,
        thumbnail: thumbnail,
      };

      const createRes = await fetch(API("/api/media"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!createRes.ok) throw new Error("Erreur création média");

      await Swal.fire({
        icon: "success",
        title: "Succès",
        text: "Média ajouté avec succès",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchMedia();
      resetModal();

    } catch (err) {
      console.error(err);
      Swal.fire("Erreur", err.message || "Une erreur est survenue", "error");
      setModalStep(4); // Go back to metadata
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler"
    });

    if (res.isConfirmed) {
      try {
        const delRes = await fetch(API(`/api/media/${id}`), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!delRes.ok) throw new Error("Erreur suppression");

        setItems(prev => prev.filter(item => item._id !== id));
        Swal.fire("Supprimé", "Le média a été supprimé.", "success");
      } catch (err) {
        Swal.fire("Erreur", "Impossible de supprimer le média", "error");
      }
    }
  };

  // --- RENDER HELPERS ---
  const filteredItems = useMemo(() => {
    if (activeTab === "all") return items;
    return items.filter(item => item.destination === activeTab);
  }, [items, activeTab]);

  const StepsIndicator = () => (
    <div className="flex items-center justify-center mb-6 space-x-2">
      {[1, 2, 3, 4, 5].map((step) => {
        if (step === 3 && uploadType !== "video") return null; // Skip trim for images
        return (
          <div key={step} className={`h-2 w-8 rounded-full ${modalStep >= step ? "bg-red-600" : "bg-slate-700"}`} />
        );
      })}
    </div>
  );

  return (
    <AdminLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaPhotoVideo className="text-red-500" /> Médiathèque
            </h1>
            <p className="text-slate-400 mt-1">Gérez vos images et vidéos.</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-red-900/20"
          >
            <FaPlus /> Ajouter un média
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-800 pb-1">
          {[
            { id: "all", label: "Tous" },
            { id: "gallery", label: "Galerie" },
            { id: "home", label: "Extraits (Accueil)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-2 font-medium transition-colors relative ${activeTab === tab.id ? "text-red-500" : "text-slate-400 hover:text-white"
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 text-slate-500 bg-black/50 rounded-xl border border-dashed border-slate-800">
              <FaPhotoVideo className="mx-auto text-4xl mb-4 opacity-30" />
              <p>Aucun média trouvé dans {activeTab === 'all' ? 'la bibliothèque' : 'cette section'}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="group bg-black border border-slate-800 rounded-xl overflow-hidden hover:border-red-500/50 transition-colors"
                >
                  {/* Thumbnail / Preview */}
                  <div className="aspect-video relative bg-black">
                    {item.type === "image" ? (
                      <img
                        src={item.url.replace("http://", "https://")}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <video
                        src={item.url.replace("http://", "https://")}
                        className="w-full h-full object-cover"
                        controls
                        crossOrigin="anonymous"
                      />
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700"
                        title="Supprimer"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-white truncate" title={item.title}>
                      {item.title || "Sans titre"}
                    </h3>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                      <span className="uppercase bg-slate-800 px-2 py-1 rounded">{item.category}</span>
                      <span className="capitalize">{item.destination}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- ADD MEDIA MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-black border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Ajouter un média</h2>
              <button onClick={resetModal} className="text-slate-400 hover:text-white">
                <FaTimes size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <StepsIndicator />

              {/* STEP 1: TYPE SELECTION */}
              {modalStep === 1 && (
                <div className="grid grid-cols-2 gap-6 h-full py-8">
                  <button
                    onClick={() => { setUploadType("image"); setModalStep(2); }}
                    className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-slate-800/50 border-2 border-slate-700 hover:border-red-500 hover:bg-slate-800 transition-all group"
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                      <FaImage className="text-3xl text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">Photo</span>
                  </button>
                  <button
                    onClick={() => { setUploadType("video"); setModalStep(2); }}
                    className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-slate-800/50 border-2 border-slate-700 hover:border-red-500 hover:bg-slate-800 transition-all group"
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                      <FaVideo className="text-3xl text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">Vidéo</span>
                  </button>
                </div>
              )}

              {/* STEP 2: FILE SELECTION */}
              {modalStep === 2 && (
                <div className="text-center py-10">
                  <div className="border-3 border-dashed border-slate-700 rounded-2xl p-12 hover:border-red-500 hover:bg-slate-800/30 transition-all cursor-pointer relative">
                    <input
                      type="file"
                      accept={uploadType === "image" ? "image/*" : "video/*"}
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FaCloudUploadAlt className="text-6xl text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                      Glissez votre {uploadType === "image" ? "photo" : "vidéo"} ici
                    </h3>
                    <p className="text-slate-400">ou cliquez pour parcourir</p>
                  </div>
                  <button
                    onClick={() => setModalStep(1)}
                    className="mt-6 text-slate-400 hover:text-white flex items-center gap-2 mx-auto"
                  >
                    <FaArrowLeft /> Retour
                  </button>
                </div>
              )}

              {/* STEP 3: TRIM (VIDEO ONLY) */}
              {modalStep === 3 && uploadType === "video" && (
                <div className="space-y-6">
                  <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
                    {previewUrl && (
                      <video
                        id="video-preview"
                        ref={videoRef}
                        src={previewUrl}
                        className="w-full h-full object-contain"
                        controls
                        onLoadedMetadata={onVideoLoadedMetadata}
                      // Local preview doesn't need crossOrigin usually as it's blob, 
                      // but if we ever use remote url here, it might.
                      // For blob: no effect.
                      />
                    )}
                  </div>

                  {/* Trimming Controls */}
                  <div className="bg-slate-800 p-4 rounded-xl space-y-4">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Début: {trimStart.toFixed(1)}s</span>
                      <span>Fin: {trimEnd.toFixed(1)}s</span>
                      <span className="text-white font-bold">Durée: {(trimEnd - trimStart).toFixed(1)}s</span>
                    </div>

                    {/* Range Sliders */}
                    <div className="relative h-2 bg-slate-700 rounded-full">
                      {/* Visual representations would be complex to build perfectly custom, using simple inputs for now */}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400">Début</label>
                        <input
                          type="range"
                          min={0}
                          max={videoDuration}
                          step={0.1}
                          value={trimStart}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val < trimEnd) setTrimStart(val);
                            if (videoRef.current) videoRef.current.currentTime = val;
                          }}
                          className="w-full accent-red-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Fin</label>
                        <input
                          type="range"
                          min={0}
                          max={videoDuration}
                          step={0.1}
                          value={trimEnd}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val > trimStart) setTrimEnd(val);
                            if (videoRef.current) videoRef.current.currentTime = val;
                          }}
                          className="w-full accent-red-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => { setSelectedFile(null); setModalStep(2); }}
                      className="px-6 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      Changer de fichier
                    </button>
                    <button
                      onClick={handleProcessVideo}
                      disabled={isProcessing}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-wait"
                    >
                      {isProcessing ? (
                        <>
                          <FaSpinner className="animate-spin" /> Traitement...
                        </>
                      ) : (
                        <>
                          <FaCut /> Rogner & Continuer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: METADATA */}
              {modalStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Titre</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:border-red-500 focus:ring-0"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Titre du média"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Destination</label>
                      <select
                        className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:border-red-500"
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      >
                        <option value="gallery">Galerie Photos</option>
                        <option value="home">Extraits (Accueil)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Catégorie</label>
                      <select
                        className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:border-red-500"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="performance">Spectacle</option>
                        <option value="backstage">Coulisses / Portrait</option>
                        <option value="events">Événement / Scène</option>
                        <option value="video">Vidéo</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Lier à un événement (Optionnel)</label>
                    <select
                      className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:border-red-500"
                      value={formData.sourceEvent}
                      onChange={(e) => setFormData({ ...formData, sourceEvent: e.target.value })}
                    >
                      <option value="">-- Aucun --</option>
                      {events.map(evt => (
                        <option key={evt._id} value={evt._id}>{evt.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                    <textarea
                      className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:border-red-500 h-24"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description optionnelle..."
                    />
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-800">
                    <button
                      onClick={() => setModalStep(uploadType === "video" ? 3 : 2)}
                      className="px-6 py-2 rounded-lg text-slate-300 hover:text-white"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleUpload}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2"
                    >
                      <FaCloudUploadAlt /> Publier
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: UPLOADING */}
              {modalStep === 5 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">Upload en cours...</h3>
                  <p className="text-slate-400">Veuillez ne pas fermer cette fenêtre.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MediaManager;
