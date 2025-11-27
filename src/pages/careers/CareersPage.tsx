import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import jobService from "../../services/job.service";
import companyService from "../../services/company.service";
import sectionService from "../../services/section.service";
import type { Section } from "../../services/section.service";
import type { Job } from "../../services/job.service";
import type { Company } from "../../services/company.service";

export default function CareersPage() {
  const { companySlug } = useParams<{ companySlug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!companySlug) return;

      try {
        const [companyData, sectionsData, jobsData] = await Promise.all([
          companyService.getCompany(companySlug),
          sectionService.getSections(companySlug),
          jobService.getJobs(companySlug),
        ]);

        setCompany(companyData);
        setSections(sectionsData.filter((s) => s.is_visible));
        setJobs(jobsData);
      } catch (error) {
        console.error("Failed to load careers page:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [companySlug]);

  const handleSearch = async () => {
    if (!companySlug) return;

    try {
      const jobsData = await jobService.getJobs(companySlug, {
        search,
        location: locationFilter,
        jobType: typeFilter,
      });
      setJobs(jobsData);
    } catch (error) {
      console.error("Failed to filter jobs:", error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [search, locationFilter, typeFilter]);

  const getEmbedUrl = (url: string | undefined): string => {
    if (!url) return "";

    // Standard YouTube link
    if (url.includes("watch?v=")) {
      const id = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    // Short youtu.be link
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    // If already embed link
    return url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900">Company not found</h1>
      </div>
    );
  }

  const primaryColor = company.primary_color || "#4F46E5";
  const secondaryColor = company.secondary_color || "#4F46E5";

  // Get unique locations and job types for filters
  const locations = [...new Set(jobs.map((j) => j.location).filter(Boolean))];
  const jobTypes = [...new Set(jobs.map((j) => j.job_type).filter(Boolean))];

  return (
    <>
      <Helmet>
        <title>Careers at {company.name} | Join Our Team</title>
        <meta
          name="description"
          content={`Explore open positions at ${company.name}. ${jobs.length} jobs available.`}
        />
        <meta property="og:title" content={`Careers at ${company.name}`} />
        <meta
          property="og:description"
          content={`Join ${company.name}. ${jobs.length} open positions.`}
        />
        {company.banner_url && (
          <meta property="og:image" content={company.banner_url} />
        )}

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: company.name,
            url: window.location.origin + `/${companySlug}/careers`,
            logo: company.logo_url,
            description: company.description,
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Banner */}
        {company.banner_url && (
          <div className="w-full h-64 overflow-hidden">
            <img
              src={company.banner_url}
              alt={`${company.name} banner`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center gap-6 mb-8">
            {company.logo_url && (
              <img
                src={company.logo_url}
                alt={`${company.name} logo`}
                className="h-20 w-20 object-contain"
              />
            )}
            <div>
              <h1
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
                style={{ color: primaryColor }}
              >
                Careers at {company.name}
              </h1>

              {company.description && (
                <p className="text-gray-600 text-lg">{company.description}</p>
              )}
            </div>
          </div>

          {/* Culture Video */}
          {company.video_url && (
            <div className="mb-10">
              <div className="aspect-video">
                <iframe
                  src={getEmbedUrl(company?.video_url)}
                  title="Culture video"
                  className="w-full h-full rounded-lg shadow-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Dynamic Sections */}
          {sections.length > 0 && (
            <div className="mb-10 space-y-8">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <h2
                    className="text-2xl text-center font-bold mb-3"
                    style={{ color: primaryColor }}
                  >
                    {section.title}
                  </h2>
                  <p
                    className=" whitespace-pre-wrap text-center"
                    style={{ color: secondaryColor }}
                  >
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Jobs Section */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Open Positions</h2>

            {/* Filters */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search by job title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": primaryColor } as any}
                aria-label="Search jobs"
              />

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2"
                aria-label="Filter by location"
                style={{ "--tw-ring-color": secondaryColor } as any}
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2"
                aria-label="Filter by job type"
                style={{ "--tw-ring-color": secondaryColor } as any}
              >
                <option value="">All Job Types</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Job List */}
            <div className="space-y-4">
              {jobs.length === 0 && (
                <div className="text-center text-gray-500 py-10 bg-white rounded-lg">
                  No jobs found. Try adjusting your filters.
                </div>
              )}

              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/${companySlug}/job/${job.slug}`}
                  className="block bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h3>

                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                        {job.workplace && <span>{job.workplace}</span>}
                        {job.workplace && job.location && <span>•</span>}
                        {job.location && <span>{job.location}</span>}
                        {job.department && (
                          <>
                            <span>•</span>
                            <span>{job.department}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right mt-4 md:mt-0">
                      {job.salary && (
                        <span className="block font-semibold text-gray-800">
                          {job.salary}
                        </span>
                      )}
                      {job.seniority && (
                        <span className="block text-sm text-gray-500">
                          {job.seniority}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
