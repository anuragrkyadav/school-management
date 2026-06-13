import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdmissionApplicationSchema } from "@/lib/schemas";
import { toast } from "sonner";
import { Upload, X, CheckCircle, Clock } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface AdmissionFormProps {
  onSuccess?: () => void;
}

export function AdmissionEnquiryForm({ onSuccess }: AdmissionFormProps) {
  const [step, setStep] = useState<"personal" | "academic" | "parent" | "documents">("personal");
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ id: string; name: string; file: File }>>(
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(AdmissionApplicationSchema),
    mode: "onBlur",
  });

  const validateStep = async (nextStep: "personal" | "academic" | "parent" | "documents") => {
    let fieldsToValidate: any[] = [];
    if (step === "personal") {
      fieldsToValidate = ["studentName", "dateOfBirth", "gender", "currentGrade", "email", "phone"];
    } else if (step === "academic") {
      fieldsToValidate = ["applyingForGrade"];
    } else if (step === "parent") {
      fieldsToValidate = ["fatherName", "motherName", "parentEmail", "parentPhone", "address", "city", "state", "pincode"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(nextStep);
    } else {
      toast.error("Please fix form validation errors before proceeding.");
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // 1. Upload files to backend first
      const documents = await Promise.all(
        uploadedDocs.map(async (doc, idx) => {
          const formData = new FormData();
          formData.append("file", doc.file);

          const res = await fetch("/api/v1/admissions/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`Failed to upload ${doc.name}`);
          }

          const uploadData = await res.json();
          // Make sure it's a full URL so Zod schema validation passes
          const fileUrl = `${window.location.origin}${uploadData.url}`;

          let documentType: "Birth Certificate" | "Previous Marksheet" | "Transfer Certificate" | "Address Proof" | "Photo" | "Other" = "Other";
          const nameLower = doc.name.toLowerCase();
          if (nameLower.includes("birth")) {
            documentType = "Birth Certificate";
          } else if (nameLower.includes("marksheet") || nameLower.includes("report") || nameLower.includes("grade")) {
            documentType = "Previous Marksheet";
          } else if (nameLower.includes("transfer") || nameLower.includes("tc")) {
            documentType = "Transfer Certificate";
          } else if (nameLower.includes("address") || nameLower.includes("proof") || nameLower.includes("bill")) {
            documentType = "Address Proof";
          } else if (nameLower.includes("photo") || nameLower.includes("pic") || nameLower.includes("image")) {
            documentType = "Photo";
          }

          return {
            id: doc.id || `doc_${idx}_${Date.now()}`,
            documentType,
            fileName: doc.name,
            fileUrl,
            uploadedAt: new Date().toISOString(),
            verificationStatus: "Pending" as const,
          };
        })
      );

      const payload = {
        ...data,
        documents,
        applicationStatus: "Submitted",
        appliedAt: new Date().toISOString(),
      };

      await apiClient("/admissions", {
        method: "POST",
        data: payload,
      });

      toast.success("Application submitted successfully!", {
        description: "We'll review your application and contact you soon.",
      });
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit application");
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Form validation errors:", errors);
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      const stepsWithErrors: string[] = [];
      const personalFields = ["studentName", "dateOfBirth", "gender", "currentGrade", "email", "phone"];
      const academicFields = ["applyingForGrade", "currentSchool"];
      const parentFields = ["fatherName", "motherName", "parentEmail", "parentPhone", "address", "city", "state", "pincode"];

      errorFields.forEach(field => {
        if (personalFields.includes(field) && !stepsWithErrors.includes("Personal Info")) {
          stepsWithErrors.push("Personal Info");
        } else if (academicFields.includes(field) && !stepsWithErrors.includes("Academic Details")) {
          stepsWithErrors.push("Academic Details");
        } else if (parentFields.includes(field) && !stepsWithErrors.includes("Parent Details")) {
          stepsWithErrors.push("Parent Details");
        }
      });

      const fieldDetails = errorFields.map(field => {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        return `${fieldName}: ${errors[field]?.message || 'Required'}`;
      }).join(", ");

      toast.error("Form Validation Failed", {
        description: `Please fix errors in: ${stepsWithErrors.join(", ")}. Details: ${fieldDetails}`,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }
      setUploadedDocs([
        ...uploadedDocs,
        {
          id: `doc_${Date.now()}`,
          name: file.name,
          file,
        },
      ]);
    });
  };

  const removeDocument = (docId: string) => {
    setUploadedDocs(uploadedDocs.filter((d) => d.id !== docId));
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-6">
      <div className="mb-8 flex gap-2">
        {(["personal", "academic", "parent", "documents"] as const).map((s, idx) => (
          <div key={s} className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition ${
                step === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : idx < ["personal", "academic", "parent", "documents"].indexOf(step)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground"
              }`}
            >
              {idx + 1}
            </div>
            <span className="mt-2 text-xs text-muted-foreground capitalize">{s}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        {/* STEP 1: PERSONAL INFORMATION */}
        {step === "personal" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Student Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <input
                  {...register("studentName")}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter full name"
                />
                {errors.studentName && (
                  <span className="text-xs text-red-500">{errors.studentName.message}</span>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Date of Birth *</label>
                <input
                  type="date"
                  {...register("dateOfBirth")}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.dateOfBirth && (
                  <span className="text-xs text-red-500">{errors.dateOfBirth.message}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Gender *</label>
                <select
                  {...register("gender")}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <span className="text-xs text-red-500">{errors.gender.message}</span>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Current Grade *</label>
                <input
                  {...register("currentGrade")}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 9"
                />
                {errors.currentGrade && (
                  <span className="text-xs text-red-500">{errors.currentGrade.message}</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Email *</label>
              <input
                type="email"
                {...register("email")}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="student@example.com"
              />
              {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
            </div>

            <div>
              <label className="text-sm font-medium">Phone *</label>
              <input
                {...register("phone")}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="10-digit phone number"
              />
              {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
            </div>

            <button
              type="button"
              onClick={() => validateStep("academic")}
              className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Next: Academic Details →
            </button>
          </div>
        )}

        {/* STEP 2: ACADEMIC INFORMATION */}
        {step === "academic" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Academic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Current School</label>
                <input
                  {...register("currentSchool")}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="School name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Applying for Grade *</label>
                <select
                  {...register("applyingForGrade")}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select grade</option>
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
                {errors.applyingForGrade && (
                  <span className="text-xs text-red-500">{errors.applyingForGrade.message}</span>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep("personal")}
                className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => validateStep("parent")}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Next: Parent Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PARENT INFORMATION */}
        {step === "parent" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Parent Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Father's Name *</label>
                <input
                  {...register("fatherName")}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.fatherName && (
                  <span className="text-xs text-red-500">{errors.fatherName.message}</span>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Mother's Name *</label>
                <input
                  {...register("motherName")}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.motherName && (
                  <span className="text-xs text-red-500">{errors.motherName.message}</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Parent Email *</label>
              <input
                type="email"
                {...register("parentEmail")}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.parentEmail && (
                <span className="text-xs text-red-500">{errors.parentEmail.message}</span>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Parent Phone *</label>
              <input
                {...register("parentPhone")}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.parentPhone && (
                <span className="text-xs text-red-500">{errors.parentPhone.message}</span>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Address *</label>
              <textarea
                {...register("address")}
                rows={3}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.address && (
                <span className="text-xs text-red-500">{errors.address.message}</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">City *</label>
                <input
                  {...register("city")}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">State *</label>
                <input
                  {...register("state")}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Pincode *</label>
                <input
                  {...register("pincode")}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep("academic")}
                className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => validateStep("documents")}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Next: Upload Documents →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DOCUMENTS */}
        {step === "documents" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload Documents</h3>

            <label
              htmlFor="file-input"
              className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-6 text-center hover:bg-muted/40 transition-colors"
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Drag files here or click to select</p>
              <p className="text-xs text-muted-foreground">Max 5MB per file</p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-input"
              />
            </label>

            {uploadedDocs.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{uploadedDocs.length} files uploaded</p>
                {uploadedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-md border border-border p-3"
                  >
                    <span className="text-sm">{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">
              <p>Required documents:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                <li>Birth Certificate</li>
                <li>Previous school report card</li>
                <li>Address proof (electricity bill/passport)</li>
                <li>Passport-size photograph</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep("parent")}
                className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMISSION APPLICATION STATUS COMPONENT
// ─────────────────────────────────────────────────────────────

export function AdmissionApplicationStatus({ status }: { status: string }) {
  const statusConfig = {
    Draft: { icon: "✏️", color: "bg-gray-100 text-gray-700", label: "Draft" },
    Submitted: { icon: "📨", color: "bg-blue-100 text-blue-700", label: "Submitted" },
    "Under Review": { icon: "👀", color: "bg-yellow-100 text-yellow-700", label: "Under Review" },
    Approved: { icon: "✅", color: "bg-green-100 text-green-700", label: "Approved" },
    Rejected: { icon: "❌", color: "bg-red-100 text-red-700", label: "Rejected" },
    Waitlisted: { icon: "⏳", color: "bg-orange-100 text-orange-700", label: "Waitlisted" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Draft;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${config.color}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </div>
  );
}
