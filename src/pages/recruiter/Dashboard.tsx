import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import jobService from "../../services/job.service";
import sectionService from "../../services/section.service";

export default function Dashboard() {
  const { company } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, sections: 0, published: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!company) return;

      try {
        const [jobs, sections] = await Promise.all([
          jobService.getAllJobsAdmin(company.slug),
          sectionService.getSections(company.slug),
        ]);

        setStats({
          jobs: jobs.length,
          sections: sections.length,
          published: jobs.filter((j) => j.is_published).length,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [company]);

  if (!company) return null;

  const menuItems = [
    {
      title: "Theme Settings",
      link: `/${company.slug}/theme`,
      desc: "Customize logo, colors, banner",
      icon: "🎨",
    },
    {
      title: "Page Sections",
      link: `/${company.slug}/edit`,
      desc: "Add or reorder content sections",
      icon: "📝",
    },
    {
      title: "Manage Jobs",
      link: `/${company.slug}/jobs`,
      desc: "Create and publish job listings",
      icon: "💼",
    },
    {
      title: "Preview Page",
      link: `/${company.slug}/preview`,
      desc: "See how your page looks",
      icon: "👁️",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {company.name} - Careers Page
          </h1>
          <p className="text-gray-600 mt-2">
            Public URL:{" "}
            <Link
              to={`/${company.slug}/careers`}
              className="text-indigo-600 hover:underline"
              target="_blank"
            >
              /{company.slug}/careers
            </Link>
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 rounded-lg shadow p-6"
              >
                <div className="h-8 w-20 bg-gray-300 rounded mb-3"></div>
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-100 rounded-lg shadow p-6">
              <p className="text-3xl font-bold text-indigo-600">{stats.jobs}</p>
              <p className="text-gray-600 mt-1">Total Jobs</p>
            </div>
            <div className="bg-green-100 rounded-lg shadow p-6">
              <p className="text-3xl font-bold text-green-600">
                {stats.published}
              </p>
              <p className="text-gray-600 mt-1">Published Jobs</p>
            </div>
            <div className="bg-purple-200 rounded-lg shadow p-6">
              <p className="text-3xl font-bold text-purple-600">
                {stats.sections}
              </p>
              <p className="text-gray-600 mt-1">Content Sections</p>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start">
                <span className="text-4xl mr-4">{item.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
