import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Phone,
  MessageCircle,
  AlertTriangle,
  X,
  Copy,
  Volume2,
  Trash2
} from 'lucide-react';
import HospitalLogo from './HospitalLogo';
import { playChimeAlert } from '../utils/audioAlert';

export default function TargetAlertPopup({
  alertRequest,
  onAccept,
  onComplete,
  onDelete,
  onDismiss
}) {
  const [copiedLine, setCopiedLine] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!alertRequest) return null;

  const isUrgent = alertRequest.urgency === 'urgent';
  const isHigh = alertRequest.urgency === 'high';
  const isAccepted = alertRequest.status === 'accepted';
  const isCompleted = alertRequest.status === 'completed';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLine(true);
    setTimeout(() => setCopiedLine(false), 2000);
  };

  const handleAcceptClick = async () => {
    setIsProcessing(true);
    try {
      await onAccept(alertRequest.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteClick = async () => {
    setIsProcessing(true);
    try {
      await onComplete(alertRequest.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm('ต้องการลบการแจ้งเตือนตามยานี้ใช่หรือไม่?')) {
      if (onDelete) onDelete(alertRequest.id);
      onDismiss();
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border-2 transition-all ${
          isUrgent
            ? 'border-red-500 shadow-red-500/30 ring-4 ring-red-400/40'
            : isHigh
            ? 'border-amber-500 shadow-amber-500/20'
            : 'border-sky-500 shadow-sky-500/20'
        }`}
      >
        {/* Banner */}
        <div
          className={`p-4 text-white flex items-center justify-between ${
            isUrgent
              ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-600'
              : isHigh
              ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700'
              : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl animate-bounce">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-900 shadow">
                  {isUrgent ? '🚨 ด่วนวิกฤต ER' : isHigh ? '⚠️ ด่วน IPD' : '🔔 แจ้งเตือนตามยา'}
                </span>
                <span className="text-xs text-white/90">
                  {new Date(alertRequest.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                </span>
              </div>
              <h3 className="font-extrabold text-base mt-0.5">
                มีการตามยาจาก {alertRequest.sourceHospitalName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => playChimeAlert(alertRequest.urgency)}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
              title="เล่นเสียงเตือนซ้ำ"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Main Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <div>
              โรงพยาบาลผู้ส่งสัญญาณ: <strong className="text-slate-900 text-sm block">{alertRequest.sourceHospitalName}</strong>
            </div>
            <HospitalLogo hospitalId={alertRequest.sourceHospitalId} size={36} />
          </div>

          {/* Contact Details of Requester */}
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-700" />
              ช่องทางติดต่อกลับไปยัง รพ.ต้นทาง ({alertRequest.sourceHospitalName})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-400 block font-semibold">ผู้ประสานงาน</span>
                <span className="font-bold text-slate-800">{alertRequest.contactPerson}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">เบอร์ห้องยา / โทรศัพท์</span>
                  <a
                    href={`tel:${alertRequest.contactPhone}`}
                    className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {alertRequest.contactPhone}
                  </a>
                </div>
              </div>

              {alertRequest.contactDirectPhone && (
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">เบอร์ตรง / มือถือด่วน</span>
                    <a
                      href={`tel:${alertRequest.contactDirectPhone}`}
                      className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {alertRequest.contactDirectPhone}
                    </a>
                  </div>
                </div>
              )}

              {alertRequest.contactLineId && (
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">LINE ID</span>
                    <span className="font-bold text-emerald-800">{alertRequest.contactLineId}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(alertRequest.contactLineId)}
                    className="p-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 transition flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedLine ? 'คัดลอกแล้ว' : 'คัดลอก'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status Feedback */}
          {isAccepted && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <strong>กดรับการตามยาแล้ว:</strong> เจ้าหน้าที่รับทราบและกำลังติดต่อประสานงานกลับ
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong>ประสานงานสำเร็จแล้ว:</strong> ส่งข้อมูลประวัติยาให้ รพ.ต้นทาง เรียบร้อยแล้ว
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
            {/* Delete button */}
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบสถานะนี้</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={onDismiss}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                ปิดหน้าต่าง
              </button>

              {!isAccepted && !isCompleted && (
                <button
                  onClick={handleAcceptClick}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:scale-102 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isProcessing ? 'กำลังบันทึก...' : '🟢 กดรับการตามยา (Acknowledge)'}
                </button>
              )}

              {isAccepted && !isCompleted && (
                <button
                  onClick={handleCompleteClick}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isProcessing ? 'กำลังบันทึก...' : '✅ ส่งประวัติยาเรียบร้อยแล้ว (ปิดเคส)'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
