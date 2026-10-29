import React, { useState } from 'react';
import { Send, X, AlertTriangle, Phone, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import HospitalLogo from './HospitalLogo';

export default function MedRequestModal({
  isOpen,
  onClose,
  targetHospital,
  sourceHospital,
  contactInfo,
  onSubmit
}) {
  const [urgency, setUrgency] = useState('normal'); // 'normal' | 'high' | 'urgent'
  const [customContactPerson, setCustomContactPerson] = useState(contactInfo?.person || '');
  const [customContactPhone, setCustomContactPhone] = useState(contactInfo?.phone || '');
  const [customContactDirect, setCustomContactDirect] = useState(contactInfo?.directPhone || '');
  const [customContactLine, setCustomContactLine] = useState(contactInfo?.lineId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetHospital) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        patientName: 'คำขอตามประวัติยา',
        patientHN: '-',
        patientCID: '-',
        sourceHospitalId: sourceHospital.id,
        targetHospitalId: targetHospital.id,
        urgency,
        medicationDetails: 'มีการแจ้งเตือนตามประวัติยา กรุณาติดต่อกลับทางช่องทางด้านล่าง',
        contactPerson: customContactPerson.trim() || contactInfo?.person || 'ห้องยา/งานเภสัชกรรม',
        contactPhone: customContactPhone.trim() || contactInfo?.phone || sourceHospital.phone,
        contactDirectPhone: customContactDirect.trim() || contactInfo?.directPhone || sourceHospital.directLine,
        contactLineId: customContactLine.trim() || contactInfo?.lineId || sourceHospital.defaultLineId
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการส่งคำขอ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HospitalLogo hospitalId={targetHospital.id} size={42} />
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-white/20 text-white rounded-full">
                ส่งสัญญาณตามยาไปยัง
              </span>
              <h2 className="text-base font-extrabold mt-0.5">{targetHospital.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Source Info */}
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs flex items-center justify-between">
            <div className="text-slate-600">
              รพ. ต้นทางผู้ตามยา: <strong className="text-blue-900">{sourceHospital.name}</strong>
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              เลือกระดับความเร่งด่วนในการตามยา
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  urgency === 'normal'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-400'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ปกติ
              </button>
              <button
                type="button"
                onClick={() => setUrgency('high')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  urgency === 'high'
                    ? 'bg-amber-50 text-amber-900 border-amber-500 ring-2 ring-amber-400'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                ด่วน (IPD)
              </button>
              <button
                type="button"
                onClick={() => setUrgency('urgent')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  urgency === 'urgent'
                    ? 'bg-rose-50 text-rose-900 border-rose-500 ring-2 ring-rose-400 animate-pulse'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                ด่วนวิกฤต (ER)
              </button>
            </div>
          </div>

          {/* Return contact channels preview & edit */}
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-2.5">
            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-700" />
              <span>ช่องทางติดต่อกลับเพื่อให้ {targetHospital.shortName} ประสานงาน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">เบอร์โทรห้องยา:</span>
                <input
                  type="text"
                  value={customContactPhone}
                  onChange={(e) => setCustomContactPhone(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 font-semibold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">เบอร์ตรง/มือถือด่วน:</span>
                <input
                  type="text"
                  value={customContactDirect}
                  onChange={(e) => setCustomContactDirect(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 font-semibold"
                />
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-500 block font-medium">LINE ID ติดต่อ:</span>
                <input
                  type="text"
                  value={customContactLine}
                  onChange={(e) => setCustomContactLine(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/30 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'กำลังส่ง...' : '🚀 ยืนยันส่งสัญญาณตามยาทันที'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
