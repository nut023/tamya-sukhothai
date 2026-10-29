import React, { useState, useEffect } from 'react';
import { Building2, Phone, User, MessageCircle, Check, X, ShieldAlert } from 'lucide-react';
import HospitalLogo from './HospitalLogo';

export default function SourceHospitalModal({
  isOpen,
  onClose,
  hospitals = [],
  currentHospital,
  contactInfo,
  onSave
}) {
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [person, setPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [lineId, setLineId] = useState('');

  useEffect(() => {
    if (currentHospital) {
      setSelectedHospitalId(currentHospital.id);
    }
    if (contactInfo) {
      setPerson(contactInfo.person || '');
      setPhone(contactInfo.phone || currentHospital?.phone || '');
      setDirectPhone(contactInfo.directPhone || currentHospital?.directLine || '');
      setLineId(contactInfo.lineId || currentHospital?.defaultLineId || '');
    }
  }, [currentHospital, contactInfo, isOpen]);

  if (!isOpen) return null;

  const handleHospitalChange = (hospId) => {
    setSelectedHospitalId(hospId);
    const target = hospitals.find((h) => h.id === hospId);
    if (target) {
      setPhone(target.phone + ' (ต่อ ' + target.pharmacyExt + ')');
      setDirectPhone(target.directLine);
      setLineId(target.defaultLineId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hosp = hospitals.find((h) => h.id === selectedHospitalId);
    if (!hosp) return;

    onSave({
      hospital: hosp,
      contact: {
        person: person.trim() || 'เจ้าหน้าที่ห้องยา/เภสัชกรรม',
        phone: phone.trim() || hosp.phone,
        directPhone: directPhone.trim() || hosp.directLine,
        lineId: lineId.trim() || hosp.defaultLineId
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">เลือกโรงพยาบาลต้นทาง (จุดประจำการของคุณ)</h2>
              <p className="text-xs text-sky-100">
                กำหนดโรงพยาบาลที่จะส่งคำขอตามยา และข้อมูลช่องทางการติดต่อกลับเมื่อ รพ. ปลายทางได้รับเรื่อง
              </p>
            </div>
          </div>
          {currentHospital && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Hospital Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. เลือกโรงพยาบาลของคุณ (เครือข่าย จ.สุโขทัย 9 อำเภอ)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
              {hospitals.map((hosp) => {
                const isSelected = hosp.id === selectedHospitalId;
                return (
                  <button
                    key={hosp.id}
                    type="button"
                    onClick={() => handleHospitalChange(hosp.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <HospitalLogo hospitalId={hosp.id} size={36} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {hosp.shortName}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {hosp.district}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Contact Information */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>2. ช่องทางการติดต่อกลับ (เพื่อให้ รพ.ปลายทาง ประสานข้อมูลยา)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-สกุล เภสัชกร / พยาบาลผู้ติดต่อ
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    placeholder="เช่น ภก.วิชัย แสงทอง (ห้องยา IPD)"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ภายใน / เบอร์ห้องยา
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 055-611800 ต่อ 1204"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรด่วน / สายตรง
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500" />
                  <input
                    type="text"
                    value={directPhone}
                    onChange={(e) => setDirectPhone(e.target.value)}
                    placeholder="เช่น 081-xxx-xxxx หรือ 055-611805"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  LINE ID / LINE Official สำหรับส่งไฟล์ประวัติยา
                </label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-2.5 w-4 h-4 text-emerald-600" />
                  <input
                    type="text"
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    placeholder="เช่น @sukhothai_rx หรือไอดีส่วนตัว"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {currentHospital && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                ยกเลิก
              </button>
            )}
            <button
              type="submit"
              disabled={!selectedHospitalId}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              บันทึกและเข้าสู่ระบบ TAMYA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

