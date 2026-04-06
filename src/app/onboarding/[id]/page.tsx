"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

interface OnboardingData {
  businessNameLegal: string;
  businessNameDba: string;
  ownerName: string;
  ownerTitle: string;
  phone: string;
  email: string;
  currentDomain: string;
  domainRegistrar: string;
  currentHosting: string;
  hasLogo: string;
  brandColors: string;
  yearFounded: string;
  servicesOffered: string;
  serviceArea: string;
  socialMedia: string;
  googleBusinessProfile: string;
  preferredContact: string;
  specialRequests: string;
  testimonials: string;
}

const initialData: OnboardingData = {
  businessNameLegal: "",
  businessNameDba: "",
  ownerName: "",
  ownerTitle: "",
  phone: "",
  email: "",
  currentDomain: "",
  domainRegistrar: "",
  currentHosting: "",
  hasLogo: "",
  brandColors: "",
  yearFounded: "",
  servicesOffered: "",
  serviceArea: "",
  socialMedia: "",
  googleBusinessProfile: "",
  preferredContact: "",
  specialRequests: "",
  testimonials: "",
};

export default function OnboardingPage() {
  const params = useParams();
  const prospectId = params.id as string;
  const [data, setData] = useState<OnboardingData>(initialData);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/onboarding/${prospectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep mx-auto mb-6 flex items-center justify-center text-3xl">
            ✓
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Welcome to BlueJays!
          </h1>
          <p className="text-muted text-lg mb-6">
            Thank you for your submission! We&apos;ve received your information
            and will have your custom website live within 48 hours.
          </p>
          <p className="text-muted">
            You&apos;ll receive an email with next steps shortly.
          </p>
          <div className="mt-8 p-6 rounded-xl bg-surface border border-border text-left">
            <h3 className="font-semibold mb-3">What happens next:</h3>
            <ol className="space-y-2 text-sm text-muted">
              <li>1. We customize your site with your branding</li>
              <li>2. We connect your domain (or set up a new one)</li>
              <li>3. Final review with you for any tweaks</li>
              <li>4. Your site goes live!</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Welcome Aboard!</h1>
          <p className="text-muted text-lg">
            Fill out this form so we can customize your website and get it
            live on your domain.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto px-6 py-12 space-y-10"
      >
        {/* Business Info */}
        <Section title="Business Information">
          <Field
            label="Legal Business Name"
            name="businessNameLegal"
            value={data.businessNameLegal}
            onChange={handleChange}
            required
          />
          <Field
            label="DBA / Trade Name (if different)"
            name="businessNameDba"
            value={data.businessNameDba}
            onChange={handleChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Owner Name"
              name="ownerName"
              value={data.ownerName}
              onChange={handleChange}
              required
            />
            <Field
              label="Title"
              name="ownerTitle"
              value={data.ownerTitle}
              onChange={handleChange}
              placeholder="e.g., Owner, CEO, Manager"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Phone Number"
              name="phone"
              value={data.phone}
              onChange={handleChange}
              required
            />
            <Field
              label="Email Address"
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
              required
            />
          </div>
          <Field
            label="Year Founded"
            name="yearFounded"
            value={data.yearFounded}
            onChange={handleChange}
            placeholder="e.g., 2015"
          />
        </Section>

        {/* Domain & Hosting */}
        <Section title="Domain & Hosting">
          <Field
            label="Current Domain (if you have one)"
            name="currentDomain"
            value={data.currentDomain}
            onChange={handleChange}
            placeholder="e.g., mybusiness.com"
          />
          <Field
            label="Domain Registrar + Login"
            name="domainRegistrar"
            value={data.domainRegistrar}
            onChange={handleChange}
            placeholder="e.g., GoDaddy, Namecheap (we'll help transfer if needed)"
          />
          <Field
            label="Current Hosting Provider + Login"
            name="currentHosting"
            value={data.currentHosting}
            onChange={handleChange}
            placeholder="e.g., Bluehost, HostGator, or 'none'"
          />
        </Section>

        {/* Branding */}
        <Section title="Branding">
          <div>
            <label className="block text-sm font-medium mb-2">
              Do you have a logo?
            </label>
            <select
              name="hasLogo"
              value={data.hasLogo}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-foreground text-sm"
            >
              <option value="">Select...</option>
              <option value="yes-upload">
                Yes, I&apos;ll upload it
              </option>
              <option value="yes-send">
                Yes, I&apos;ll email it to you
              </option>
              <option value="no-create">
                No, please create one for me
              </option>
              <option value="no-skip">No, skip the logo</option>
            </select>
          </div>
          <Field
            label="Brand Colors"
            name="brandColors"
            value={data.brandColors}
            onChange={handleChange}
            placeholder="e.g., Navy blue and gold, or 'let us choose'"
          />
        </Section>

        {/* Business Details */}
        <Section title="Business Details">
          <TextArea
            label="Services Offered"
            name="servicesOffered"
            value={data.servicesOffered}
            onChange={handleChange}
            placeholder="List your main services, one per line"
          />
          <Field
            label="Service Area / Locations"
            name="serviceArea"
            value={data.serviceArea}
            onChange={handleChange}
            placeholder="e.g., Austin metro area, Travis County"
          />
          <TextArea
            label="Social Media Links"
            name="socialMedia"
            value={data.socialMedia}
            onChange={handleChange}
            placeholder="Instagram, Facebook, Yelp, etc. — one per line"
            rows={3}
          />
          <Field
            label="Google Business Profile Link"
            name="googleBusinessProfile"
            value={data.googleBusinessProfile}
            onChange={handleChange}
          />
        </Section>

        {/* Preferences */}
        <Section title="Preferences & Extras">
          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred Contact Method
            </label>
            <select
              name="preferredContact"
              value={data.preferredContact}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-foreground text-sm"
            >
              <option value="">Select...</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="text">Text</option>
            </select>
          </div>
          <TextArea
            label="Any Specific Requests or Must-Haves"
            name="specialRequests"
            value={data.specialRequests}
            onChange={handleChange}
            placeholder="Anything specific you want on your site?"
            rows={3}
          />
          <TextArea
            label="Testimonials / Reviews You Want Featured"
            name="testimonials"
            value={data.testimonials}
            onChange={handleChange}
            placeholder="Paste any customer quotes you'd like on the site"
            rows={3}
          />
        </Section>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-electric to-blue-deep text-white font-semibold text-lg disabled:opacity-50 hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-shadow"
        >
          {loading ? "Submitting..." : "Submit & Get Started"}
        </button>
      </form>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-foreground text-sm placeholder:text-muted/50"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm placeholder:text-muted/50 resize-y"
      />
    </div>
  );
}
