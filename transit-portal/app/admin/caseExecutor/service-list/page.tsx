"use client";

import { useEffect, useState } from "react";
import useServiceStore from "@/modules/mot/service/service.store";
import { IService, ServiceStatus } from "@/modules/mot/service/service.types";
import { Clock } from "lucide-react";

export default function ServiceListPage() {
  const { services, getAllServices, loading } = useServiceStore();

  const [tab, setTab] = useState<"not-started" | "pending" | "completed">("not-started");

  useEffect(() => {
    getAllServices();
  }, []);

  // Status groups
  const NOT_STARTED = [
    ServiceStatus.Draft,
    ServiceStatus.Submitted,
    ServiceStatus.UnderReview,
    ServiceStatus.Approved
  ];

  const PENDING = [
    ServiceStatus.Pending,
    ServiceStatus.InProgress
  ];

  const COMPLETED = [
    ServiceStatus.Completed
  ];

  // Filter based on tab
  const filtered =
    tab === "not-started"
      ? services.filter((s) => NOT_STARTED.includes(s.status))
      : tab === "pending"
      ? services.filter((s) => PENDING.includes(s.status))
      : services.filter((s) => COMPLETED.includes(s.status));

  return (
    <div className="p-10">

      {/* Page Title */}
      <h1 className="text-3xl font-bold">Service list</h1>
      <p className="text-gray-500 mt-2">
        View and manage your assigned services grouped by their current status.
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-10 mt-8 border-b pb-3">

        {/* Not Started */}
        <button
          onClick={() => setTab("not-started")}
          className={`flex items-center gap-2 ${
            tab === "not-started"
              ? "text-blue-600 border-b-2 border-blue-600 pb-2"
              : "text-gray-500"
          }`}
        >
          ○ Not Started
          <span className="text-gray-400">{services.filter(s => NOT_STARTED.includes(s.status)).length}</span>
        </button>

        {/* Pending */}
        <button
          onClick={() => setTab("pending")}
          className={`flex items-center gap-2 ${
            tab === "pending"
              ? "text-yellow-600 border-b-2 border-yellow-600 pb-2"
              : "text-gray-500"
          }`}
        >
          ⏳ Pending
          <span className="text-gray-400">{services.filter(s => PENDING.includes(s.status)).length}</span>
        </button>

        {/* Completed */}
        <button
          onClick={() => setTab("completed")}
          className={`flex items-center gap-2 ${
            tab === "completed"
              ? "text-green-600 border-b-2 border-green-600 pb-2"
              : "text-gray-500"
          }`}
        >
          ✔ Completed
          <span className="text-gray-400">{services.filter(s => COMPLETED.includes(s.status)).length}</span>
        </button>

        {/* New Service Button */}
        <button className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">
          + New Service
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="mt-10 text-gray-500">Loading services...</p>}

      {/* Service Cards */}
      <div className="grid grid-cols-3 gap-6 mt-10">
        {filtered.map((service: IService) => (
          <div
            key={service.id}
            className="bg-white shadow rounded-xl p-6 border hover:shadow-md transition cursor-pointer"
          >
            <h2 className="font-semibold text-lg">{service.serviceNumber}</h2>

            <p className="text-gray-500 mt-2 text-sm">
              {service.itemDescription}
            </p>

            {/* Due Date Placeholder */}
            <div className="flex items-center justify-end mt-4 text-gray-400 text-sm">
              <Clock size={14} className="mr-1" />
              Due: 23 May
            </div>

            {/* Status Bar */}
            <div className="mt-4">
              <span className="text-gray-500 text-sm">
                {tab === "not-started" && "Not Started"}
                {tab === "pending" && "Pending"}
                {tab === "completed" && "Completed"}
              </span>

              <div className="w-full bg-gray-200 h-2 rounded mt-2"></div>
            </div>
          </div>
        ))}
      </div>

      {/* No Data */}
      {!loading && filtered.length === 0 && (
        <p className="mt-10 text-gray-500">No services found in this category.</p>
      )}
    </div>
  );
}
