import { useState, useEffect } from "react";
import { API } from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";
import { FaUser, FaLock, FaEnvelope, FaCamera, FaSave } from "react-icons/fa";

const Settings = () => {
    const [admin, setAdmin] = useState({
        name: "",
        email: "",
        photo: "",
    });
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        photo: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const storedAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
        setAdmin(storedAdmin);
        setFormData((prev) => ({
            ...prev,
            name: storedAdmin.name || "",
            email: storedAdmin.email || "",
            photo: storedAdmin.photo || "",
        }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(API("/api/auth/profile"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    photo: formData.photo,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur lors de la mise à jour");
            }

            localStorage.setItem("admin", JSON.stringify(data.admin));
            setAdmin(data.admin);
            setMessage({ type: "success", text: "Profil mis à jour avec succès" });
            setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
        } catch (error) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Paramètres du compte</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="bg-black border border-slate-800 rounded-2xl p-6 h-fit">
                        <div className="flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-slate-800 overflow-hidden mb-4 relative group cursor-pointer">
                                {formData.photo ? (
                                    <img
                                        src={formData.photo}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        <FaUser className="text-4xl" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaCamera className="text-white text-2xl" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-white">{admin.name || "Admin"}</h2>
                            <p className="text-slate-400 text-sm">{admin.email}</p>
                        </div>
                    </div>

                    {/* Settings Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="bg-black border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <FaUser className="text-red-500" /> Informations personnelles
                            </h2>

                            {message.text && (
                                <div
                                    className={`p-4 rounded-lg mb-6 ${message.type === "success"
                                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                                        }`}
                                >
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-slate-400 mb-2 text-sm">Nom</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-2 text-sm">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-slate-400 mb-2 text-sm">URL Photo de profil</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="photo"
                                        value={formData.photo}
                                        onChange={handleChange}
                                        placeholder="https://example.com/photo.jpg"
                                        className="w-full bg-black border border-slate-800 rounded-lg p-3 pl-10 text-white focus:border-red-500 outline-none transition-colors"
                                    />
                                    <FaCamera className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 pt-6 border-t border-slate-800">
                                <FaLock className="text-red-500" /> Sécurité
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-slate-400 mb-2 text-sm">Mot de passe actuel</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-slate-400 mb-2 text-sm">Nouveau mot de passe</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 mb-2 text-sm">Confirmer le mot de passe</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave /> Enregistrer les modifications
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Settings;
