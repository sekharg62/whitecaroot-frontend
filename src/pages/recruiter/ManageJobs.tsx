import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import jobService from "../../services/job.service";
import type { Job } from "../../services/job.service";
import type { CreateJobData } from "../../services/job.service";

export default function ManageJobs() {
  const { company } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<CreateJobData>({
    title: "",
    description: "",
    workplace: "",
    location: "",
    department: "",
    jobType: "",
    seniority: "",
    salary: "",
    isPublished: false,
  });

  useEffect(() => {
    loadJobs();
  }, [company]);

  const loadJobs = async () => {
    if (!company) return;

    try {
      const data = await jobService.getAllJobsAdmin(company.slug);
      setJobs(data);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!company) return;

    try {
      if (editingJob) {
        await jobService.updateJob(company.slug, editingJob.id, formData);
      } else {
        await jobService.createJob(company.slug, formData);
      }

      await loadJobs();
      setShowModal(false);
      setEditingJob(null);
      resetForm();
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      workplace: job.workplace,
      location: job.location,
      department: job.department,
      jobType: job.job_type,
      seniority: job.seniority,
      salary: job.salary,
      isPublished: job.is_published,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!company || !confirm("Delete this job?")) return;

    try {
      await jobService.deleteJob(company.slug, id);
      await loadJobs();
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    if (!company) return;

    try {
      await jobService.togglePublish(company.slug, id, isPublished);
      await loadJobs();
    } catch (error) {
      console.error("Failed to toggle publish:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      workplace: "",
      location: "",
      department: "",
      jobType: "",
      seniority: "",
      salary: "",
      isPublished: false,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Manage Jobs</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white border rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-gray-600">
                  {job.location} • {job.job_type} • {job.seniority}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {job.description.substring(0, 100)}...
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      job.is_published
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {job.is_published ? "Published" : "Draft"}
                  </span>
                  <span className="text-sm text-gray-500">
                    Created: {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTogglePublish(job.id, !job.is_published)}
                  className={`px-3 py-1 rounded text-sm ${
                    job.is_published
                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {job.is_published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleEdit(job)}
                  className="text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded hover:bg-indigo-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No jobs yet. Add your first job!
        </div>
      )}

      <button
        onClick={() => {
          setEditingJob(null);
          resetForm();
          setShowModal(true);
        }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
      >
        + Add Job
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingJob ? "Edit Job" : "Add New Job"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Job description..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Workplace</label>
                  <select
                    value={formData.workplace}
                    onChange={(e) =>
                      setFormData({ ...formData, workplace: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select</option>
                    <option value="on-site">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., New York, NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Engineering"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) =>
                      setFormData({ ...formData, jobType: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Seniority</label>
                  <select
                    value={formData.seniority}
                    onChange={(e) =>
                      setFormData({ ...formData, seniority: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Salary</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., $100k - $150k"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label>Publish immediately</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingJob(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
