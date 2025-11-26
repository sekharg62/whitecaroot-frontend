import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import companyService from "../../services/company.service";
import type { CompanyTheme } from "../../services/company.service";
import { API_CONFIG } from "../../config/api.config";

export default function ThemeEditor() {
  const { company } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<CompanyTheme | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");
  const [secondaryColor, setSecondaryColor] = useState("#10B981");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      if (!company) return;

      try {
        const themeData = await companyService.getTheme(company.slug);
        setTheme(themeData);
        setPrimaryColor(themeData.primary_color || "#4F46E5");
        setSecondaryColor(themeData.secondary_color || "#10B981");
        setVideoUrl(themeData.video_url || "");
      } catch (error) {
        console.error("Failed to load theme:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, [company]);

  const handleFileUpload = async (
    file: File,
    type: "logo" | "banner"
  ): Promise<string> => {
    if (!company) throw new Error("No company");

    const setUploadState =
      type === "logo" ? setUploadingLogo : setUploadingBanner;
    setUploadState(true);

    try {
      const result = await companyService.uploadImage(company.slug, file);
      const fullUrl = `${API_CONFIG.BASE_URL}${result.url}`;

      // Update theme with new URL
      await companyService.updateTheme(company.slug, {
        [type === "logo" ? "logoUrl" : "bannerUrl"]: fullUrl,
      });

      return fullUrl;
    } finally {
      setUploadState(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleFileUpload(file, "logo");
      setTheme((prev) => (prev ? { ...prev, logo_url: url } : prev));
      setMessage("Logo uploaded successfully!");
    } catch (error) {
      setMessage("Failed to upload logo");
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleFileUpload(file, "banner");
      setTheme((prev) => (prev ? { ...prev, banner_url: url } : prev));
      setMessage("Banner uploaded successfully!");
    } catch (error) {
      setMessage("Failed to upload banner");
    }
  };

  const handleSave = async () => {
    if (!company) return;

    setSaving(true);
    setMessage("");

    try {
      await companyService.updateTheme(company.slug, {
        primaryColor,
        secondaryColor,
        videoUrl,
      });

      setMessage("Theme saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Theme Settings</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Dashboard
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="font-medium block mb-2">Company Logo</label>
          {theme?.logo_url && (
            <img
              src={theme.logo_url}
              alt="Logo"
              className="mb-2 h-20 object-contain"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            disabled={uploadingLogo}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {uploadingLogo && (
            <p className="text-sm text-gray-500 mt-1">Uploading...</p>
          )}
        </div>

        <div>
          <label className="font-medium block mb-2">Banner Image</label>
          {theme?.banner_url && (
            <img
              src={theme.banner_url}
              alt="Banner"
              className="mb-2 h-32 w-full object-cover rounded"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            disabled={uploadingBanner}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {uploadingBanner && (
            <p className="text-sm text-gray-500 mt-1">Uploading...</p>
          )}
        </div>

        <div>
          <label className="font-medium block mb-2">Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-16 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="font-medium block mb-2">Secondary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-16 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="font-medium block mb-2">
            Culture Video URL (YouTube/Vimeo Embed)
          </label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/..."
            className="border rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {saving ? "Saving..." : "Save Theme"}
      </button>
    </div>
  );
}
