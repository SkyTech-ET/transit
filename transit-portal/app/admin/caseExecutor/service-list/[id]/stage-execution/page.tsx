// app/service-list/[id]/stage-execution/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Upload,
  Input,
  Select,
  Radio,
  Space,
  message as antdMessage,
  Divider,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import useServiceStore from "@/modules/mot/service/service.store";
import http from "@/modules/utils/axios";
import {
  IServiceStageExecution,
  StageStatus,
  ServiceStage,
  DocumentType,
} from "@/modules/mot/service/service.types";
import { useRouter } from "next/navigation";

const { TextArea } = Input;
const { Option } = Select;

/**
 * Exact single-column Stage Execution page.
 * All stages (1..10) are displayed sequentially on the page.
 *
 * Backend endpoints used:
 * - POST /api/v1/CaseExecutor/services/{serviceId}/stages/{stageId}/documents
 * - POST /api/v1/CaseExecutor/services/{serviceId}/stages/{stageId}/comments
 * - PUT  /api/v1/CaseExecutor/services/{serviceId}/stages/{stageId}/status (via store)
 *
 * Design reference image (uploaded by you):
 * /mnt/data/3b3a6e7d-b30f-4f34-a0fa-41163c128078.png
 */

type Props = { params: { id: string } };

export default function StageExecutionPage({ params }: Props) {
  const serviceId = Number(params.id);
  const router = useRouter();

  const {
    currentService,
    getServiceById,
    getServiceStages,
    updateStageStatus,
  } = useServiceStore();

  // page-level state (re-used for multiple stages)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comment, setComment] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // small local fields used in certain stages
  const [riskNote, setRiskNote] = useState<string>("");
  const [tagIssue, setTagIssue] = useState<string>("None");
  const [driverName, setDriverName] = useState<string>("");
  const [carPlate, setCarPlate] = useState<string>("");
  const [driverPhone, setDriverPhone] = useState<string>("+251970000000");
  const [customerDocsRequested, setCustomerDocsRequested] = useState<"Yes" | "No">("No");
  const [responsibleTransporter, setResponsibleTransporter] = useState<string | undefined>(undefined);

  // load data
  useEffect(() => {
    if (!serviceId) return;
    getServiceById(serviceId).catch(() => {});
    getServiceStages(serviceId).catch(() => {});
  }, [serviceId, getServiceById, getServiceStages]);

  const stages: IServiceStageExecution[] = currentService?.stages ?? [];

  // helper: find stage exec object by enum
  const findStageExec = (stageEnum: ServiceStage) =>
    stages.find((s) => s.stage === stageEnum) ?? null;

  // upload file helper (FormData)
  const uploadStageFile = async (stageExec: IServiceStageExecution | null, docType: DocumentType = DocumentType.Other, description?: string) => {
    if (!stageExec) {
      antdMessage.warning("No stage selected for upload.");
      return;
    }
    if (!selectedFile) {
      antdMessage.warning("Please choose a file first.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("documentType", String(docType));
      if (description) fd.append("description", description);

      const url = `/api/v1/CaseExecutor/services/${serviceId}/stages/${stageExec.id}/documents`;
      await http.post({ url, data: fd });

      antdMessage.success("File uploaded");
      setSelectedFile(null);
      // refresh
      await getServiceStages(serviceId);
      await getServiceById(serviceId);
    } catch (err: any) {
      console.error(err);
      antdMessage.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // post comment helper
  const postStageComment = async (stageExec: IServiceStageExecution | null, commentText: string, commentType?: string) => {
    if (!stageExec) {
      antdMessage.warning("Select a stage");
      return;
    }
    if (!commentText.trim()) {
      antdMessage.warning("Enter a comment");
      return;
    }
    setSaving(true);
    try {
      const url = `/api/v1/CaseExecutor/services/${serviceId}/stages/${stageExec.id}/comments`;
      await http.post({
        url,
        data: {
          Comment: commentText,
          CommentType: commentType ?? null,
          IsInternal: false,
          IsVisibleToCustomer: true,
        },
      });
      antdMessage.success("Comment saved");
      setComment("");
      await getServiceById(serviceId);
      await getServiceStages(serviceId);
    } catch (err: any) {
      console.error(err);
      antdMessage.error(err?.message || "Failed to save comment");
    } finally {
      setSaving(false);
    }
  };

  // update stage status via store action (store will call the correct endpoint)
  const setStageStatus = async (stageExec: IServiceStageExecution | null, status: StageStatus, notes?: string) => {
    if (!stageExec) {
      antdMessage.warning("Select a stage");
      return;
    }
    setSaving(true);
    try {
      await updateStageStatus(stageExec.id, status, notes);
      antdMessage.success("Stage status updated");
      await getServiceStages(serviceId);
      await getServiceById(serviceId);
    } catch (err: any) {
      console.error(err);
      antdMessage.error(err?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  // helper render small file list
  const renderSelectedFile = () =>
    selectedFile ? (
      <div style={{ marginTop: 8, color: "#111827" }}>
        {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
      </div>
    ) : null;

  // Small helper to show stage block header icon & label (keeps code tidy)
  const StageHeader = ({ number, title, color }: { number: number; title: string; color?: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: color ?? "#3b82f6",
          color: "#fff",
          fontWeight: 700,
        }}
      >
        {number}
      </div>
      <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
    </div>
  );

  // Render attachments list for a stage (very simple)
  const renderDocsForStage = (stageExec: IServiceStageExecution | null) => {
    if (!stageExec || !stageExec.documents || stageExec.documents.length === 0) {
      return <div style={{ color: "#6b7280" }}>No attachments</div>;
    }
    return stageExec.documents.map((d: any) => (
      <div key={d.id} style={{ display: "flex", justifyContent: "space-between", background: "#fbfbfd", padding: 8, borderRadius: 6, marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 600 }}>{d.originalFileName ?? d.fileName}</div>
          <div style={{ color: "#6b7280", fontSize: 12 }}>{new Date(d.uploadedDate).toLocaleString()}</div>
        </div>
        <div>
          <a href={d.filePath} target="_blank" rel="noreferrer">Download</a>
        </div>
      </div>
    ));
  };


  const stageOrder = [
  ServiceStage.PrepaymentInvoice,
  ServiceStage.DropRisk,
  ServiceStage.DeliveryOrder,
  ServiceStage.Exit,
  ServiceStage.Inspection,
  ServiceStage.Emergency,
  ServiceStage.FinalStage, // (or whatever your enum is)
  ServiceStage.Transportation,
  ServiceStage.Clearance,
  ServiceStage.Settlement,
];

const stageLabels = [
  "Prepayment",
  "Drop Risk",
  "Delivery Order",
  "Warehouse",
  "Inspection",
  "Spot",
  "Exit & Storage",
  "Transportation",
  "Clearance",
  "Settlement",
];

  

  // ---------- PAGE LAYOUT ----------
  // We'll render stages 1..10 exactly as blocks in the screenshot
  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: "100 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>Stage Execution</h1>
        <div>
          <Button onClick={() => router.back()}>Back</Button>
        </div>
      </div>

      {/* ---- PROGRESS BAR ---- */}
<div style={{ marginBottom: 32, display: "flex", justifyContent: "flex-start" }}>
  <div style={{ display: "flex", alignItems: "Baseline", gap: 10 }}>
    {stageOrder.map((stage, index) => {
      const stageExec = stages.find((s) => s.stage === stage);
      const isCompleted = stageExec?.status === StageStatus.Completed;
      const isCurrent = currentService?.currentStage === stage;

      return (
        <React.Fragment key={stage}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isCompleted
                  ? "#3b82f6" // BLUE (completed)
                  : isCurrent
                  ? "#2563eb" // DARK BLUE (current)
                  : "#e5e7eb", // GRAY (pending)
                color: isCompleted || isCurrent ? "#fff" : "#6b7280",
                fontWeight: 600,
                fontSize: 14,
                border: "2px solid #d1d5db",
              }}
            >
              {isCompleted ? "✓" : index + 1}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#111827" }}>
              {stageLabels[index]}
            </div>
          </div>

          {/* connector line */}
          {index < stageOrder.length - 1 && (
            <div
              style={{
                width: 50,
                height: 2,
                background: isCompleted ? "#3b82f6" : "#e5e7eb",
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
</div>


      {/* ---------- Stage 1: Prepayment Invoice ---------- */}
      <section style={{ padding: 18, borderRadius: 8, marginBottom: 18, border: "1px solid #eef2f7" }}>
        <StageHeader number={1} title="Prepayment Invoice" color="#0ea5e9" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "center" }}>
          <div>
            <div style={{ marginBottom: 6, color: "#111827", fontWeight: 600 }}>Upload Proof of Receipt</div>
            <Space>
              <Upload
                beforeUpload={(f) => {
                  setSelectedFile(f);
                  return false;
                }}
                fileList={selectedFile ? [{ uid: "1", name: selectedFile.name, size: selectedFile.size }] : []}
                onRemove={() => setSelectedFile(null)}
                maxCount={1}
                showUploadList={{ showPreviewIcon: false }}
              >
                <Button icon={<UploadOutlined />}>choose file</Button>
              </Upload>
              <Button type="primary" onClick={() => uploadStageFile(findStageExec(ServiceStage.PrepaymentInvoice), DocumentType.Invoice)} loading={uploading} disabled={!selectedFile}>
                Upload
              </Button>
            </Space>
            {renderSelectedFile()}
          </div>

          <div>
            <div style={{ marginBottom: 6, color: "#111827", fontWeight: 600 }}>Comments (If discrepancies)</div>
            <TextArea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <Space>
            <Button type="primary" onClick={async () => { await postStageComment(findStageExec(ServiceStage.PrepaymentInvoice), comment); await setStageStatus(findStageExec(ServiceStage.PrepaymentInvoice), StageStatus.InProgress); }}>
              Save & Next
            </Button>
            <Button onClick={() => { setComment(""); setSelectedFile(null); }}>Cancel</Button>
          </Space>
        </div>
      </section>

      <Divider />

      {/* ---------- Stage 2: Drop Risk ---------- */}
      <section style={{ padding: 18, borderRadius: 8, marginBottom: 18, border: "1px solid #eef2f7" }}>
        <StageHeader number={2} title="Drop Risk" color="#10b981" />
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          {/* risk buttons B G Y R */}
          {[
            { label: "B", value: 1, color: "#0ea5e9" },
            { label: "G", value: 2, color: "#10b981" },
            { label: "Y", value: 3, color: "#f59e0b" },
            { label: "R", value: 4, color: "#ef4444" },
          ].map((r) => (
            <Button
              key={r.label}
              style={{ borderRadius: 20, background: "#fff", border: `1px solid ${r.color}`, color: r.color }}
              onClick={async () => {
                try {
                  await http.put({ url: `/api/v1/CaseExecutor/services/${serviceId}/risk-level`, data: { RiskLevel: r.value, RiskNotes: riskNote || "" } });
                  antdMessage.success(`Risk set to ${r.label}`);
                  await getServiceById(serviceId);
                } catch (e) {
                  console.error(e);
                  antdMessage.error("Failed to set risk");
                }
              }}
            >
              {r.label}
            </Button>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}>Reason / Comments</div>
          <TextArea rows={2} value={riskNote} onChange={(e) => setRiskNote(e.target.value)} />
        </div>

        <Space>
          <Button type="primary" onClick={async () => { await postStageComment(findStageExec(ServiceStage.DropRisk), riskNote); await setStageStatus(findStageExec(ServiceStage.DropRisk), StageStatus.Pending); }}>
            Save & Next
          </Button>
          <Button onClick={() => setRiskNote("")}>Cancel</Button>
        </Space>
      </section>

      <Divider />

      {/* ---------- Stage 3: Delivery Order (DO) ---------- */}
      <section style={{ padding: 18, borderRadius: 8, marginBottom: 18, border: "1px solid #eef2f7" }}>
        <StageHeader number={3} title="Delivery Order (DO)" color="#f59e0b" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ marginBottom: 6 }}>Upload DO Documents</div>
            <Space>
              <Upload
                beforeUpload={(f) => { setSelectedFile(f); return false; }}
                fileList={selectedFile ? [{ uid: "1", name: selectedFile.name, size: selectedFile.size }] : []}
                onRemove={() => setSelectedFile(null)}
                maxCount={1}
                showUploadList={{ showPreviewIcon: false }}
              >
                <Button icon={<UploadOutlined />}>choose file</Button>
              </Upload>
              <Button onClick={() => uploadStageFile(findStageExec(ServiceStage.DeliveryOrder), DocumentType.Other)} disabled={!selectedFile} loading={uploading}>
                Upload
              </Button>
            </Space>
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Tag Issues</div>
            <Select value={tagIssue} onChange={(val) => setTagIssue(val)} style={{ width: 240 }}>
              <Option value="None">None</Option>
              <Option value="Damaged">Damaged</Option>
              <Option value="Missing">Missing Items</Option>
            </Select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <Space>
            <Button type="default" onClick={() => setStageStatus(findStageExec(ServiceStage.DeliveryOrder), StageStatus.Completed)}>
              Mark as Completed
            </Button>
            <Button style={{ background: "#fde68a", borderColor: "#fcd34d" }} onClick={() => setStageStatus(findStageExec(ServiceStage.DeliveryOrder), StageStatus.NeedsReview)}>
              Needs Review
            </Button>
          </Space>
        </div>
      </section>

      <Divider />

      {/* ---------- Stage 4: Warehouse Status ---------- */}
      <section style={{ padding: 18, borderRadius: 8, marginBottom: 18, border: "1px solid #eef2f7" }}>
        <StageHeader number={4} title="Warehouse Status" color="#7c3aed" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ marginBottom: 6 }}>Photo of Item (on-site)</div>
            <Upload
              beforeUpload={(f) => { setSelectedFile(f); return false; }}
              fileList={selectedFile ? [{ uid: "1", name: selectedFile.name, size: selectedFile.size }] : []}
              onRemove={() => setSelectedFile(null)}
              maxCount={1}
              showUploadList={{ showPreviewIcon: false }}
            >
              <Button icon={<UploadOutlined />}>choose file</Button>
            </Upload>
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Settlement Notes</div>
            <Input placeholder="E.g. Store ID: 234, Delays: None" />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <Button type="primary" onClick={() => setStageStatus(findStageExec(ServiceStage.Exit), StageStatus.InProgress)}>
            Save & Next
          </Button>
        </div>
      </section>

      <Divider />

      {/* ---------- Stage 5: Inspection ---------- */}
      <section style={{ padding: 18, borderRadius: 8, marginBottom: 18, border: "1px solid #eef2f7" }}>
        <StageHeader number={5} title="Inspection" color="#10b981" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ marginBottom: 6 }}>Summary (from Customs System)</div>
            <TextArea placeholder="Paste summary here..." rows={2} />
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Attach Inspection Docs</div>
            <Upload
              beforeUpload={(f) => { setSelectedFile(f); return false; }}
              fileList={selectedFile ? [{ uid: "1", name: selectedFile.name, size: selectedFile.size }] : []}
              onRemove={() => setSelectedFile(null)}
              maxCount={1}
              showUploadList={{ showPreviewIcon: false }}
            >
              <Button icon={<UploadOutlined />}>choose file</Button>
            </Upload>
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Customer Confirmation</div>
            <div style={{ background: "#dcfce7", padding: 8, borderRadius: 6, color: "#065f46", fontWeight: 600 }}>👍 Agree</div>

            <div style={{ marginTop: 8 }}>
              <div style={{ marginBottom: 6 }}>Upload Second Tax Invoice</div>
              <Upload
                beforeUpload={(f) => { setSelectedFile(f); return false; }}
                fileList={[]}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>choose file</Button>
              </Upload>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <Button type="primary" onClick={() => setStageStatus(findStageExec(ServiceStage.Inspection), StageStatus.Completed)}>
            Save & Next
          </Button>
        </div>
      </section>

      <Divider />

      {/* ---------- Stage 7: Spot (Emergency in enum) ---------- */}
      <section style={{ padding: 18, borderRadius: 8, marginBottom: 18, border: "1px solid #eef2f7" }}>
        <StageHeader number={7} title="Spot" color="#ef4444" />
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}>Critical Updates / Comments</div>
          <TextArea placeholder="Add urgent customs comments..." rows={2} value={comment} onChange={(e) => setComment(e.target.value)} style={{ borderColor: "#fecaca" }} />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Button style={{ background: "#e6f0ff", borderColor: "#cfe3ff", color: "#0b57d0" }} onClick={async () => await setStageStatus(findStageExec(ServiceStage.Emergency), StageStatus.Completed, "Released")}>
            Released
          </Button>
          <Button style={{ background: "#ffeef0", borderColor: "#ffd5d9", color: "#b91c1c" }} onClick={async () => { await postStageComment(findStageExec(ServiceStage.Emergency), comment || "Notify manager", "Urgent"); antdMessage.success("Manager notified"); }}>
            Notify
          </Button>
        </div>
      </section>

      <Divider />

      {/* ---------- Stage 8: Exit & Storage Payment ---------- */}
      <section style={{ padding: 18, borderRadius: 8, marginBottom: 18, border: "1px solid #eef2f7" }}>
        <StageHeader number={8} title="Exit and Storage Payment" color="#f59e0b" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ marginBottom: 6 }}>Upload Storage Fee Receipt</div>
            <Upload
              beforeUpload={(f) => { setSelectedFile(f); return false; }}
              fileList={selectedFile ? [{ uid: "1", name: selectedFile.name, size: selectedFile.size }] : []}
              onRemove={() => setSelectedFile(null)}
              maxCount={1}
              showUploadList={{ showPreviewIcon: false }}
            >
              <Button icon={<UploadOutlined />}>choose file</Button>
            </Upload>
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Mark Service</div>
            <div style={{ background: "#fff7ed", padding: 8, borderRadius: 6, border: "1px solid #fde68a", color: "#b45309", fontWeight: 700 }}>
              Ready for Transport
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ---------- Stage 9: Transportation ---------- */}
      <section style={{ padding: 18, borderRadius: 8, marginBottom: 18, border: "1px solid #eef2f7" }}>
        <StageHeader number={9} title="Transportation" color="#06b6d4" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ marginBottom: 6 }}>Driver Full Name</div>
            <Input placeholder="Enter driver name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Car Plate Number</div>
            <Input placeholder="Plate number" value={carPlate} onChange={(e) => setCarPlate(e.target.value)} />
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Driver License Attachment</div>
            <Upload
              beforeUpload={(f) => { setSelectedFile(f); return false; }}
              fileList={selectedFile ? [{ uid: "1", name: selectedFile.name, size: selectedFile.size }] : []}
              onRemove={() => setSelectedFile(null)}
              maxCount={1}
              showUploadList={{ showPreviewIcon: false }}
            >
              <Button icon={<UploadOutlined />}>choose file</Button>
            </Upload>
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Drivers phone number</div>
            <Input placeholder="+251970000000" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <Space>
            <Button type="primary" onClick={async () => {
              const note = `Driver: ${driverName} | Plate: ${carPlate} | Phone: ${driverPhone}`;
              await postStageComment(findStageExec(ServiceStage.Transportation), note, "DriverInfo");
              antdMessage.success("Driver details saved");
            }}>
              Save & Next
            </Button>
          </Space>
        </div>
      </section>

      <Divider />

      {/* ---------- Stage 10: Clearance ---------- */}
      <section style={{ padding: 18, borderRadius: 8, marginBottom: 18, border: "1px solid #eef2f7" }}>
        <StageHeader number={10} title="Clearance" color="#7c3aed" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ marginBottom: 6 }}>Customer Requested Docs?</div>
            <Select value={customerDocsRequested} onChange={(val: any) => setCustomerDocsRequested(val)}>
              <Option value="No">No</Option>
              <Option value="Yes">Yes</Option>
            </Select>
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Upload Cleared Documents</div>
            <Upload
              beforeUpload={(f) => { setSelectedFile(f); return false; }}
              fileList={selectedFile ? [{ uid: "1", name: selectedFile.name, size: selectedFile.size }] : []}
              onRemove={() => setSelectedFile(null)}
              maxCount={1}
              showUploadList={{ showPreviewIcon: false }}
            >
              <Button icon={<UploadOutlined />}>choose file</Button>
            </Upload>
            <div style={{ marginTop: 8 }}>
              <Button onClick={() => uploadStageFile(findStageExec(ServiceStage.Clearance), DocumentType.Certificate)} disabled={!selectedFile} loading={uploading}>Upload</Button>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Responsible Transporter</div>
            <Select placeholder="Tag Transporter" value={responsibleTransporter} onChange={(v) => setResponsibleTransporter(v)}>
              <Option value="Transporter A">Transporter A</Option>
              <Option value="Transporter B">Transporter B</Option>
              <Option value="Transporter C">Transporter C</Option>
            </Select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <Button type="primary" onClick={() => setStageStatus(findStageExec(ServiceStage.Clearance), StageStatus.Completed)}>Save & Next</Button>
        </div>
      </section>

      <Divider />

      {/* ---------- End of page (Stage 11 left as simple complete block) ---------- */}
      <section style={{ padding: 18, borderRadius: 8, marginBottom: 24, border: "1px solid #eef2f7" }}>
        <StageHeader number={11} title="Store Settlement / Finalization" color="#6b21a8" />
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}>Notes</div>
          <TextArea rows={3} />
        </div>
        <Space>
          <Button type="primary" onClick={() => antdMessage.info("Finalized (call backend if needed)")}>Save & Complete</Button>
        </Space>
      </section>
    </div>
  );
}
