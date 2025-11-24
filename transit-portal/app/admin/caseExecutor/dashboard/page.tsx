"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/modules/caseExecutor";

export default function DashboardPage() {
  const { dashboard, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  // FALLBACKS so the UI always renders
  const assigned = dashboard?.serviceSummary || {
    notStarted: 0,
    pending: 0,
    completed: 0,
  };

  const tasks = dashboard?.taskSummary || { stagesAwaitingUpdate: 0 };
  const alerts = dashboard?.serviceAlerts || { flaggedRisks: 0 };
  const messages = dashboard?.messages || { newMessages: 0 };
  const uploads = dashboard?.uploads || { unAttachedDocs: 0 };

  const work = dashboard?.workSummary || {
    totalAssigned: 0,
    completed: 0,
    timeSpentToday: "0h 0m",
    issuesRaised: 0,
  };

  const activityLog = dashboard?.activityLog || [];
  const notifications = dashboard?.notifications || [];

  return (
    <div className="p-8 space-y-8">

      {/* PAGE TITLE */}
      <h2 className="text-2xl font-semibold">Dashboard Overview</h2>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-5 gap-4">

        {/* Assigned Services */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="font-semibold text-sm">Assigned Services</div>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Not Started</span>
              <span className="text-blue-600 font-semibold">{assigned.notStarted}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending</span>
              <span className="text-yellow-500 font-semibold">{assigned.pending}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed</span>
              <span className="text-green-600 font-semibold">{assigned.completed}</span>
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="font-semibold text-sm">Today's Tasks</div>
          <div className="mt-4 text-blue-600 text-2xl font-bold">
            {tasks.stagesAwaitingUpdate}
          </div>
          <div className="text-xs text-gray-500">Stages awaiting update</div>
        </div>

        {/* Service Alerts */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="font-semibold text-sm text-red-500">Service Alerts</div>
          <div className="mt-4 text-red-500 text-2xl font-bold">
            {alerts.flaggedRisks}
          </div>
          <div className="text-xs text-gray-500">Blockers or flagged risks</div>
        </div>

        {/* Message Notifications */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="font-semibold text-sm">Message Notifications</div>
          <div className="mt-4 text-blue-600 text-2xl font-bold">
            {messages.newMessages}
          </div>
          <div className="text-xs text-gray-500">New chats/messages</div>
        </div>

        {/* Document Uploads */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="font-semibold text-sm">Document Uploads</div>
          <div className="mt-4 text-blue-600 text-2xl font-bold">
            {uploads.unAttachedDocs}
          </div>
          <div className="text-xs text-gray-500">Unattached required docs</div>
        </div>

      </div>

      {/* SERVICE OVERVIEW */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Service Overview</h3>

        <div className="grid grid-cols-2 gap-5">

          {/* Multimodal */}
          <div className="rounded-xl p-6 bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200">
            <div className="font-semibold text-blue-700 flex items-center gap-2">
              <span className="text-xl">📦</span> Multimodal Services
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <button className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm shadow hover:bg-blue-700">
              View Multimodal
            </button>
          </div>

          {/* Unimodal */}
          <div className="rounded-xl p-6 bg-gradient-to-r from-green-100 to-green-50 border border-green-200">
            <div className="font-semibold text-green-700 flex items-center gap-2">
              <span className="text-xl">🔗</span> Unimodal Services
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <button className="mt-4 px-4 py-2 rounded-lg bg-green-600 text-white text-sm shadow hover:bg-green-700">
              View Unimodal
            </button>
          </div>

        </div>
      </div>

      {/* WORK SUMMARY */}
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Work Summary</h3>
          <a className="text-blue-600 text-sm font-medium cursor-pointer">View Detailed Summary →</a>
        </div>

        <div className="grid grid-cols-4 gap-5 mt-4">

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Total Assigned</div>
            <div className="text-2xl text-blue-600 font-bold mt-2">
              {work.totalAssigned}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-2xl text-green-600 font-bold mt-2">
              {work.completed}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Time Spent (Today)</div>
            <div className="text-2xl text-blue-600 font-bold mt-2">
              {work.timeSpentToday}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Issues Raised</div>
            <div className="text-2xl text-red-500 font-bold mt-2">
              {work.issuesRaised}
            </div>
          </div>

        </div>
      </div>

      {/* QUICK NOTES */}
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Quick Notes & Templates</h3>
          <a className="text-blue-600 text-sm font-medium cursor-pointer">Manage Templates →</a>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-orange-500 text-xl">📝</span> Inspection Update
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Customs inspection complete, pending document upload.
            </p>
            <button className="mt-4 text-blue-600 text-sm font-medium">Use</button>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-red-500 text-xl">⚠️</span> Emergency Alert
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Customs authorities issued urgent instructions.
            </p>
            <button className="mt-4 text-blue-600 text-sm font-medium">Use</button>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-yellow-500 text-xl">📄</span> Missing Documents
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Please upload the required documents to proceed.
            </p>
            <button className="mt-4 text-blue-600 text-sm font-medium">Use</button>
          </div>

        </div>
      </div>

      {/* ACTIVITY + NOTIFICATIONS */}
      <div className="grid grid-cols-2 gap-6">

        {/* My Activity Log */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">My Activity Log</h3>

          {activityLog.length === 0 && (
            <p className="text-gray-500 text-sm">No activity yet.</p>
          )}

          <div className="space-y-4">
            {activityLog.map((log) => (
              <div key={log.id} className="pb-3 border-b">
                <div className="font-medium text-blue-700">{log.title}</div>
                <div className="text-sm text-gray-500">{log.description}</div>
                <div className="text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Recent Notifications</h3>

          {notifications.length === 0 && (
            <p className="text-gray-500 text-sm">No notifications available.</p>
          )}

          <div className="space-y-4">
            {notifications.map((n) => (
              <div key={n.id} className="pb-3 border-b">
                <div className="font-medium text-blue-700">{n.title}</div>
                <div className="text-sm text-gray-500">{n.description}</div>
                <div className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
