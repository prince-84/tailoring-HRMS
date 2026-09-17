"use client";

import { useEffect, useRef, useState } from "react";
import { X, UploadCloud, FileText, Trash2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Shared field styles — matches the HRMS form styling in the screenshots.    */
/* -------------------------------------------------------------------------- */

const labelClass = "mb-1.5 block text-[15px] font-medium text-slate-700";
const selectClass =
  "w-full rounded-md border border-slate-200 bg-slate-50/80 px-3.5 py-3 text-[15px] text-slate-900 " +
  "focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500";
const dateClass =
  "w-full rounded-md border border-slate-200 bg-white px-3.5 py-3 text-[15px] text-slate-900 " +
  "focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500";

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={labelClass}>
      <span className="mr-1 text-red-500">*</span>
      {children}
    </label>
  );
}

/* -------------------------------------------------------------------------- */

export interface LeaveRequestFormValues {
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  description: string;
  attachments: File[];
}

export interface CreateLeaveRequestModalProps {
  open: boolean;
  onClose: () => void;
  employees: any[];
  leaveTypes: any[];
  onSubmit?: (values: LeaveRequestFormValues) => void;
}

export default function CreateLeaveRequestModal({
  open,
  onClose,
  employees,
  leaveTypes,
  onSubmit,
}: CreateLeaveRequestModalProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredEmployees = employees.filter((employee) =>
    `${employee.first_name} ${employee.last_name}`
      .toLowerCase()
      .includes(employeeSearch.toLowerCase())
  );

  /* Close on Escape + lock background scroll while open */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  
  useEffect(() => {
    if (!open) {
      setEmployeeId("");
      setEmployeeSearch("");
      setShowEmployeeDropdown(false);
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setIsHalfDay(false);
      setDescription("");
      setAttachments([]);
      setIsDragging(false);
    }
  }, [open]);
  
  if (!open) return null;
  
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setAttachments((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({
      employeeId,
      leaveType,
      startDate,
      endDate,
      isHalfDay,
      description,
      attachments,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-leave-request-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-lg bg-[#f6f5f2] shadow-xl">
        {/* ---------------- Header ---------------- */}
        <div className="flex items-start justify-between px-6 pb-2 pt-6">
          <h2
            id="create-leave-request-title"
            className="text-xl font-bold text-slate-900"
          >
            Create new request
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded border-2 border-teal-400 p-1 text-slate-800 transition-colors hover:bg-teal-50"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* ---------------- Scrollable body ---------------- */}
        <form
          id="create-leave-request-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-6 pb-2 pt-3"
        >
          
          {/* Employee */}
          <div className="relative">
            <RequiredLabel htmlFor="employeeSearch">Employee</RequiredLabel>

            <input
              id="employeeSearch"
              type="text"
              value={employeeSearch}
              onChange={(e) => {
                setEmployeeSearch(e.target.value);
                setEmployeeId("");
                setShowEmployeeDropdown(true);
              }}
              onFocus={() => setShowEmployeeDropdown(true)}
              placeholder="Search Employee"
              required={!employeeId}
              className={selectClass}
            />

            {showEmployeeDropdown && employeeSearch && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => {
                        setEmployeeId(employee.id);
                        setEmployeeSearch(
                          `${employee.first_name} ${employee.last_name}`
                        );
                        setShowEmployeeDropdown(false);
                      }}
                      className="block w-full px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <span className="block font-medium text-slate-800">
                        {employee.first_name} {employee.last_name}
                      </span>

                      {employee.department?.name && (
                        <span className="block text-xs text-slate-500">
                          {employee.department.name}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-3.5 py-2.5 text-sm text-slate-500">
                    No employees found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Leave Type */}
          <div>
            <RequiredLabel htmlFor="leaveType">Leave Type</RequiredLabel>
            <select
              id="leaveType"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              required
              className={selectClass}
            >
              <option value="" disabled>Select leave type</option>
              {leaveTypes.map((type) => (
              <option key={type.id} value={type.id}>
              {type.name}
              </option>
))}
            </select>
          </div>

          {/* Start / End date */}
          <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
            <div>
              <RequiredLabel htmlFor="startDate">Start Date</RequiredLabel>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className={dateClass}
              />
            </div>
            <div>
              <RequiredLabel htmlFor="endDate">End Date</RequiredLabel>
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className={dateClass}
              />
            </div>
          </div>

          {/* Is half day */}
          <div className="flex items-center gap-2.5">
            <input
              id="isHalfDay"
              type="checkbox"
              checked={isHalfDay}
              onChange={(e) => setIsHalfDay(e.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-2 border-teal-400 text-teal-600 accent-teal-600 focus:ring-teal-500"
            />
            <label
              htmlFor="isHalfDay"
              className="cursor-pointer text-[15px] text-slate-700"
            >
              Is half day
            </label>
          </div>

          {/* Info banner */}
          <div className="flex gap-3 rounded-md bg-[#fefce8] px-4 py-4">
            <span
              aria-hidden="true"
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500"
            />
            <p className="text-[15px] leading-relaxed text-slate-700">
              First day and last day means that those days &quot;INCLUDED&quot; the
              employee will be off
            </p>
          </div>

          {/* Description */}
          <div>
            <RequiredLabel htmlFor="description">Description</RequiredLabel>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Please help us understand the reason for your leave"
              className={`${selectClass} resize-y placeholder:text-slate-600`}
            />
          </div>

          {/* Attachments */}
          <div>
            <label className={labelClass}>Attachments</label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-10 text-center transition-colors ${
                isDragging
                  ? "border-teal-400 bg-teal-50/50"
                  : "border-slate-300 hover:border-slate-400"
              }`}
            >
              <UploadCloud className="mb-3 h-9 w-9 text-slate-500" strokeWidth={1.75} />
              <p className="text-[15px] text-slate-600">
                Drop files or click to select multiple files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {/* Selected files list (only renders once files are chosen) */}
            {attachments.length > 0 && (
              <ul className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate text-sm text-slate-700">
                        {file.name}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      aria-label={`Remove ${file.name}`}
                      className="ml-3 shrink-0 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>

        {/* ---------------- Footer ---------------- */}
        {/* NOTE: cropped out of the screenshot — styled to match the HRMS buttons. */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
          >
            CANCEL
          </button>
          <button
            type="submit"
            form="create-leave-request-form"
            className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            SUBMIT REQUEST
          </button>
        </div>
      </div>
    </div>
  );
}
