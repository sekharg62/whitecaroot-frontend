import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import jobService from "../../services/job.service";
import type { Job } from "../../services/job.service";

export default function JobDetails() {
  const { companySlug, jobSlug } = useParams<{
    companySlug: string;
    jobSlug: string;
  }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJob = async () => {
      if (!companySlug || !jobSlug) return;

      try {
        const jobData = await jobService.getJob(companySlug, jobSlug);
        setJob(jobData);
      } catch (err: any) {
        setError("Job not found");
        console.error("Failed to load job:", err);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [companySlug, jobSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
        <Link
          to={`/${companySlug}/careers`}
          className="text-indigo-600 hover:underline"
        >
          ← Back to careers page
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Job link copied to clipboard!");
    }
  };

  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.created_at,
    employmentType: job.job_type,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name || companySlug,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
      },
    },
    baseSalary: job.salary
      ? {
          "@type": "MonetaryAmount",
          currency: "INR",
          value: {
            "@type": "QuantitativeValue",
            value: job.salary,
          },
        }
      : undefined,
  };

  return (
    <>
      <Helmet>
        <title>
          {job.title} | {job.company_name || companySlug}
        </title>
        <meta name="description" content={job.description.substring(0, 160)} />
        <meta property="og:title" content={job.title} />
        <meta
          property="og:description"
          content={job.description.substring(0, 160)}
        />
        <meta property="og:type" content="website" />

        {/* JSON-LD Structured Data for Job Posting */}
        <script type="application/ld+json">
          {JSON.stringify(jobPostingSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <Link
            to={`/${companySlug}/careers`}
            className="text-indigo-600 hover:underline mb-6 inline-block"
          >
            ← Back to all jobs
          </Link>

          <div className="bg-white shadow-md rounded-xl p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>

            <div className="mt-3 text-gray-600 flex flex-wrap gap-3 text-sm">
              {job.workplace && <span>{job.workplace}</span>}
              {job.workplace && job.location && <span>•</span>}
              {job.location && <span>{job.location}</span>}
              {job.department && (
                <>
                  <span>•</span>
                  <span>{job.department}</span>
                </>
              )}
              {job.job_type && (
                <>
                  <span>•</span>
                  <span>{job.job_type}</span>
                </>
              )}
            </div>

            {/* Salary + Level */}
            {(job.salary || job.seniority) && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg border">
                {job.salary && (
                  <p className="font-semibold text-gray-800">{job.salary}</p>
                )}
                {job.seniority && (
                  <p className="text-sm text-gray-600">{job.seniority}</p>
                )}
              </div>
            )}

            {/* Job Description */}
            <h2 className="text-xl font-semibold mt-10 mb-3">About the Role</h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>

            {/* Buttons */}
            <div className="mt-10 flex flex-col md:flex-row gap-4">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg w-full md:w-auto transition"
                onClick={() =>
                  alert(
                    "Application form would open here. Integrate with your ATS."
                  )
                }
              >
                Apply Now
              </button>

              <button
                onClick={handleShare}
                className="border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-lg w-full md:w-auto transition"
              >
                Share Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
