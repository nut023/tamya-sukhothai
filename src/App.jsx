import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  Activity,
  Building2,
  Phone,
  MessageCircle,
  Bell,
  CheckCircle2,
  Clock,
  RefreshCw,
  Send,
  AlertTriangle,
  Settings,
  Sparkles,
  MapPin,
  Layers,
  Volume2,
  Trash2
} from 'lucide-react';

import SukhothaiMap from './components/SukhothaiMap';
import HospitalLogo from './components/HospitalLogo';
import SourceHospitalModal from './components/SourceHospitalModal';
import MedRequestModal from './components/MedRequestModal';
import TargetAlertPopup from './components/TargetAlertPopup';
import RequestTracker from './components/RequestTracker';
import { playChimeAlert } from './utils/audioAlert';

// Default hospital data fallback
const DEFAULT_HOSPITALS = [
  {
    id: "sukhothai",
    name: "โรงพยาบาลสุโขทัย",
    shortName: "รพ.สุโขทัย",
    district: "อำเภอเมืองสุโขทัย",
    type: "โรงพยาบาลทั่วไป (ศูนย์เชี่ยวชาญ)",
    bedCount: "350 เตียง",
    lat: 17.0044,
    lng: 99.8166,
    phone: "055-611800",
    pharmacyExt: "1204, 1205",
    directLine: "055-611805",
    defaultLineId: "@sukhothai_rx",
    badgeColor: "#0284c7"
  },
  {
    id: "sri-sangworn",
    name: "โรงพยาบาลศรีสังวรสุโขทัย",
    shortName: "รพ.ศรีสังวรสุโขทัย",
    district: "อำเภอศรีสำโรง",
    type: "โรงพยาบาลทั่วไป",
    bedCount: "270 เตียง",
    lat: 17.1594,
    lng: 99.8601,
    phone: "055-681555",
    pharmacyExt: "1140",
    directLine: "055-681560",
    defaultLineId: "@srisangworn_rx",
    badgeColor: "#0d9488"
  },
  {
    id: "sawankhalok",
    name: "โรงพยาบาลสวรรคโลก",
    shortName: "รพ.สวรรคโลก",
    district: "อำเภอสวรรคโลก",
    type: "โรงพยาบาลชุมชน (แม่ข่าย)",
    bedCount: "120 เตียง",
    lat: 17.3155,
    lng: 99.8317,
    phone: "055-641951",
    pharmacyExt: "108",
    directLine: "055-641955",
    defaultLineId: "@swk_hospital_rx",
    badgeColor: "#2563eb"
  },
  {
    id: "si-satchanalai",
    name: "โรงพยาบาลศรีสัชนาลัย",
    shortName: "รพ.ศรีสัชนาลัย",
    district: "อำเภอศรีสัชนาลัย",
    type: "โรงพยาบาลชุมชน",
    bedCount: "60 เตียง",
    lat: 17.5186,
    lng: 99.7562,
    phone: "055-671234",
    pharmacyExt: "112",
    directLine: "055-671239",
    defaultLineId: "@sisatcha_rx",
    badgeColor: "#7c3aed"
  },
  {
    id: "thung-saliam",
    name: "โรงพยาบาลทุ่งเสลี่ยม",
    shortName: "รพ.ทุ่งเสลี่ยม",
    district: "อำเภอทุ่งเสลี่ยม",
    type: "โรงพยาบาลชุมชน",
    bedCount: "30 เตียง",
    lat: 17.3069,
    lng: 99.5597,
    phone: "055-659024",
    pharmacyExt: "105",
    directLine: "055-659028",
    defaultLineId: "@thungsaliam_rx",
    badgeColor: "#059669"
  },
  {
    id: "ban-dan-lan-hoi",
    name: "โรงพยาบาลบ้านด่านลานหอย",
    shortName: "รพ.บ้านด่านลานหอย",
    district: "อำเภอบ้านด่านลานหอย",
    type: "โรงพยาบาลชุมชน",
    bedCount: "30 เตียง",
    lat: 17.0093,
    lng: 99.5786,
    phone: "055-689100",
    pharmacyExt: "104",
    directLine: "055-689105",
    defaultLineId: "@bandan_rx",
    badgeColor: "#d97706"
  },
  {
    id: "si-nakhon",
    name: "โรงพยาบาลศรีนคร",
    shortName: "รพ.ศรีนคร",
    district: "อำเภอศรีนคร",
    type: "โรงพยาบาลชุมชน",
    bedCount: "30 เตียง",
    lat: 17.3486,
    lng: 100.0827,
    phone: "055-651234",
    pharmacyExt: "103",
    directLine: "055-651238",
    defaultLineId: "@sinakhon_rx",
    badgeColor: "#db2777"
  },
  {
    id: "khiri-mat",
    name: "โรงพยาบาลคีรีมาศ",
    shortName: "รพ.คีรีมาศ",
    district: "อำเภอคีรีมาศ",
    type: "โรงพยาบาลชุมชน",
    bedCount: "30 เตียง",
    lat: 16.8329,
    lng: 99.7963,
    phone: "055-693111",
    pharmacyExt: "107",
    directLine: "055-693115",
    defaultLineId: "@khirimat_rx",
    badgeColor: "#4f46e5"
  },
  {
    id: "kong-krailat",
    name: "โรงพยาบาลกงไกรลาส",
    shortName: "รพ.กงไกรลาส",
    district: "อำเภอกงไกรลาส",
    type: "โรงพยาบาลชุมชน",
    bedCount: "30 เตียง",
    lat: 16.9452,
    lng: 100.0274,
    phone: "055-691122",
    pharmacyExt: "106",
    directLine: "055-691126",
    defaultLineId: "@kongkrailat_rx",
    badgeColor: "#ea580c"
  }
];

export default function App() {
  const [hospitals, setHospitals] = useState(DEFAULT_HOSPITALS);
  const [currentHospital, setCurrentHospital] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Modals state
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [targetHospitalForModal, setTargetHospitalForModal] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [activeAlertPopupRequest, setActiveAlertPopupRequest] = useState(null);
  const [notificationToast, setNotificationToast] = useState(null);

  const socketRef = useRef(null);

  // Initialize from LocalStorage or Defaults
  useEffect(() => {
    const savedHospId = localStorage.getItem('tamya_current_hospital_id');
    const savedContact = localStorage.getItem('tamya_contact_info');

    let initialHosp = DEFAULT_HOSPITALS[0]; // รพ.สุโขทัย as default
    if (savedHospId) {
      const match = DEFAULT_HOSPITALS.find((h) => h.id === savedHospId);
      if (match) initialHosp = match;
    }
    setCurrentHospital(initialHosp);

    if (savedContact) {
      try {
        setContactInfo(JSON.parse(savedContact));
      } catch (e) {
        setContactInfo({
          person: 'ภก.ประจำห้องยา',
          phone: initialHosp.phone,
          directPhone: initialHosp.directLine,
          lineId: initialHosp.defaultLineId
        });
      }
    } else {
      setContactInfo({
        person: 'ภก.ประจำห้องยา',
        phone: initialHosp.phone + ' (ต่อ ' + initialHosp.pharmacyExt + ')',
        directPhone: initialHosp.directLine,
        lineId: initialHosp.defaultLineId
      });
    }

    // Load hospitals from backend
    fetch('/api/hospitals')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHospitals(data);
          // sync current if needed
          if (savedHospId) {
            const found = data.find((h) => h.id === savedHospId);
            if (found) setCurrentHospital(found);
          }
        }
      })
      .catch((err) => console.log('Using default hospital list', err));

    // Load requests from backend
    fetch('/api/requests')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRequests(data);
      })
      .catch((err) => console.error('Failed to load requests:', err));
  }, []);

  // Setup Socket.io connection
  useEffect(() => {
    const socket = io('/', {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsSocketConnected(true);
      if (currentHospital?.id) {
        socket.emit('join-hospital', currentHospital.id);
      }
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    socket.on('requests-updated', (updatedRequests) => {
      setRequests(updatedRequests);
    });

    // Incoming alert for this specific target hospital
    socket.on('new-request-alert', (newReq) => {
      playChimeAlert(newReq.urgency);
      setActiveAlertPopupRequest(newReq);
      showToast(`🚨 มีคำขอตามประวัติยาใหม่จาก ${newReq.sourceHospitalName}!`, 'urgent');
    });

    // Alert when target hospital accepts the request
    socket.on('request-accepted-alert', (req) => {
      playChimeAlert('normal');
      showToast(`🟢 ${req.targetHospitalName} ได้ "กดรับการตามยา" ของท่านแล้ว!`, 'success');
    });

    // Alert when request is completed
    socket.on('request-completed-alert', (req) => {
      playChimeAlert('normal');
      showToast(`✅ ${req.targetHospitalName} ส่งประวัติยาเรียบร้อยแล้ว`, 'info');
    });

    return () => {
      socket.disconnect();
    };
  }, [currentHospital?.id]);

  // Join/leave room when currentHospital changes
  useEffect(() => {
    if (socketRef.current && currentHospital?.id) {
      socketRef.current.emit('join-hospital', currentHospital.id);
    }
  }, [currentHospital]);

  const showToast = (message, type = 'info') => {
    setNotificationToast({ message, type });
    setTimeout(() => {
      setNotificationToast(null);
    }, 6000);
  };

  // Switch hospital & contact
  const handleSaveSourceHospital = ({ hospital, contact }) => {
    if (currentHospital && socketRef.current) {
      socketRef.current.emit('leave-hospital', currentHospital.id);
    }
    setCurrentHospital(hospital);
    setContactInfo(contact);
    localStorage.setItem('tamya_current_hospital_id', hospital.id);
    localStorage.setItem('tamya_contact_info', JSON.stringify(contact));
    if (socketRef.current) {
      socketRef.current.emit('join-hospital', hospital.id);
    }
    showToast(`สลับจุดประจำการเป็น: ${hospital.name}`, 'info');
  };

  // Open modal to send request to target hospital
  const handleSelectTargetHospital = (targetHosp) => {
    if (targetHosp.id === currentHospital?.id) {
      setIsSourceModalOpen(true);
      return;
    }
    setTargetHospitalForModal(targetHosp);
    setIsRequestModalOpen(true);
  };

  // Submit new request
  const handleSendMedRequest = async (requestPayload) => {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });
    if (!res.ok) throw new Error('Failed to send request');
    const created = await res.json();
    showToast(`ส่งคำขอตามประวัติยาไปยัง ${targetHospitalForModal.name} สำเร็จ!`, 'success');
  };

  // Target hospital accepts request ("🟢 กดรับการตามยา")
  const handleAcceptRequest = async (requestId) => {
    const res = await fetch(`/api/requests/${requestId}/accept`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acceptedBy: contactInfo?.person || 'เภสัชกรห้องยา' })
    });
    if (!res.ok) throw new Error('Failed to accept request');
    const updated = await res.json();
    if (activeAlertPopupRequest?.id === requestId) {
      setActiveAlertPopupRequest(updated);
    }
    showToast('กดรับการตามยาเรียบร้อยแล้ว! กำลังค้นหาข้อมูลประวัติยา', 'success');
  };

  // Target hospital completes request
  const handleCompleteRequest = async (requestId) => {
    const res = await fetch(`/api/requests/${requestId}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completionNote: 'ส่งมอบประวัติยาเรียบร้อยแล้ว' })
    });
    if (!res.ok) throw new Error('Failed to complete');
    const updated = await res.json();
    if (activeAlertPopupRequest?.id === requestId) {
      setActiveAlertPopupRequest(updated);
    }
    showToast('บันทึกปิดเคสการส่งประวัติยาเรียบร้อยแล้ว', 'info');
  };

  // Delete single request
  const handleDeleteRequest = async (requestId) => {
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('ลบสถานะรายการตามยาสำเร็จ', 'info');
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  // Clear all requests
  const handleClearAllRequests = async () => {
    try {
      const res = await fetch('/api/requests', {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('ล้างสถานะการตามยาทั้งหมดเรียบร้อยแล้ว', 'info');
      }
    } catch (err) {
      console.error('Clear all error', err);
    }
  };

  // Calculate pending counts per hospital for map badges
  const pendingCounts = {};
  requests.forEach((r) => {
    if (r.status === 'pending') {
      pendingCounts[r.targetHospitalId] = (pendingCounts[r.targetHospitalId] || 0) + 1;
    }
  });

  const myIncomingPending = requests.filter(
    (r) => r.targetHospitalId === currentHospital?.id && r.status === 'pending'
  );

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {notificationToast && (
        <div className="fixed top-4 right-4 z-[2000] max-w-md animate-in slide-in-from-top duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 text-white ${
              notificationToast.type === 'urgent'
                ? 'bg-rose-600 border-rose-500 shadow-rose-600/40 ring-4 ring-rose-400/30'
                : notificationToast.type === 'success'
                ? 'bg-emerald-600 border-emerald-500 shadow-emerald-600/30'
                : 'bg-slate-900 border-slate-700 shadow-slate-900/40'
            }`}
          >
            <Bell className="w-5 h-5 shrink-0 animate-bounce" />
            <p className="text-xs font-bold leading-tight">{notificationToast.message}</p>
          </div>
        </div>
      )}

      {/* Main Top Navigation Header */}
      <header className="sticky top-0 z-[500] bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Logo & System Title */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-sky-700 to-indigo-800 bg-clip-text text-transparent">
                    TAMYA สุโขทัย
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    Sukhothai MedTrack
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  ระบบติดตามประวัติยาระหว่างโรงพยาบาล 9 อำเภอ จ.สุโขทัย
                </p>
              </div>
            </div>

            {/* Quick Mobile status */}
            <div className="lg:hidden flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isSocketConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </div>
          </div>

          {/* Current Hospital & Contact Info Indicator (User's Station) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            {currentHospital && (
              <div className="flex items-center gap-2.5 p-1.5 pl-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
                <HospitalLogo hospitalId={currentHospital.id} size={32} />
                <div className="text-left text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">รพ.ต้นทางของคุณ:</span>
                    <strong className="text-slate-800 font-bold">{currentHospital.shortName}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-[260px]">
                    {contactInfo?.person} • {contactInfo?.phone}
                  </div>
                </div>

                <button
                  onClick={() => setIsSourceModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition"
                  title="เปลี่ยนโรงพยาบาลต้นทางหรือแก้ไขข้อมูลติดต่อกลับ"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>ตั้งค่า</span>
                </button>
              </div>
            )}

            {/* Quick Switch Dropdown for effortless multi-hospital testing */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-500 font-medium pl-1 hidden sm:inline">
                สลับบทบาท:
              </span>
              <select
                value={currentHospital?.id || ''}
                onChange={(e) => {
                  const hosp = hospitals.find((h) => h.id === e.target.value);
                  if (hosp) {
                    handleSaveSourceHospital({
                      hospital: hosp,
                      contact: {
                        person: contactInfo?.person || 'เภสัชกรประจำห้องยา',
                        phone: hosp.phone + ' (ต่อ ' + hosp.pharmacyExt + ')',
                        directPhone: hosp.directLine,
                        lineId: hosp.defaultLineId
                      }
                    });
                  }
                }}
                className="py-1 px-2 text-xs bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.shortName} ({h.district.replace('อำเภอ', 'อ.')})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Audio Alert Button */}
            <button
              onClick={() => {
                playChimeAlert('normal');
                showToast('ทดสอบเสียงเตือน: ปกติ (Harmonic Chime) 🔔', 'info');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition shadow-xs"
              title="ทดสอบระดับเสียงเตือนเมื่อมีคำขอตามยา"
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>ทดสอบเสียง</span>
            </button>

            {/* Incoming alerts bell */}
            {myIncomingPending.length > 0 && (
              <button
                onClick={() => {
                  if (myIncomingPending.length > 0) {
                    setActiveAlertPopupRequest(myIncomingPending[0]);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 animate-pulse transition"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>รอตอบรับ {myIncomingPending.length} รายการ</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* KPI / Status Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">รอ รพ.ปลายทางกดรับ</p>
              <p className="text-xl font-black text-amber-600">
                {requests.filter((r) => r.status === 'pending').length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">กำลังค้นหาประวัติยา</p>
              <p className="text-xl font-black text-blue-600">
                {requests.filter((r) => r.status === 'accepted').length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">ส่งประวัติยาเรียบร้อย</p>
              <p className="text-xl font-black text-emerald-600">
                {requests.filter((r) => r.status === 'completed').length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">เครือข่าย รพ. ในระบบ</p>
              <p className="text-xl font-black text-indigo-600">
                9 โรงพยาบาล
              </p>
            </div>
          </div>
        </div>

        {/* Sukhothai Interactive Map Section */}
        <section className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-extrabold text-slate-800">
                  แดชบอร์ดแผนที่พิกัดโรงพยาบาล จ.สุโขทัย
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                คลิกที่ <strong>Logo โรงพยาบาลเป้าหมาย</strong> บนแผนที่ เพื่อส่งคำขอตามประวัติยา
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                <span>รพ. ต้นทางของคุณ</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200" />
                <span>มีคำขอตามยาค้างอยู่</span>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <SukhothaiMap
            hospitals={hospitals}
            currentHospital={currentHospital}
            pendingCounts={pendingCounts}
            onSelectTargetHospital={handleSelectTargetHospital}
            onSwitchCurrentHospital={(hosp) => {
              handleSaveSourceHospital({
                hospital: hosp,
                contact: {
                  person: contactInfo?.person || 'เภสัชกรประจำห้องยา',
                  phone: hosp.phone + ' (ต่อ ' + hosp.pharmacyExt + ')',
                  directPhone: hosp.directLine,
                  lineId: hosp.defaultLineId
                }
              });
            }}
          />
        </section>

        {/* Medication Request Tracking Table */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              กระดานติดตามประวัติการตามยา Real-time
            </h2>
            <button
              onClick={() => {
                fetch('/api/requests')
                  .then((res) => res.json())
                  .then((data) => setRequests(data));
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>รีเฟรช</span>
            </button>
          </div>

          <RequestTracker
            requests={requests}
            currentHospital={currentHospital}
            onOpenAlert={(req) => setActiveAlertPopupRequest(req)}
            onAcceptRequest={handleAcceptRequest}
            onCompleteRequest={handleCompleteRequest}
            onDeleteRequest={handleDeleteRequest}
            onClearAllRequests={handleClearAllRequests}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        ระบบตามประวัติยาข้ามโรงพยาบาล (TAMYA - Sukhothai MedTrack) • เครือข่ายบริการสุขภาพจังหวัดสุโขทัย
      </footer>

      {/* Modal 1: Select Source Hospital & Contact Info */}
      <SourceHospitalModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        hospitals={hospitals}
        currentHospital={currentHospital}
        contactInfo={contactInfo}
        onSave={handleSaveSourceHospital}
      />

      {/* Modal 2: Send Med Request to Target Hospital */}
      <MedRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        targetHospital={targetHospitalForModal}
        sourceHospital={currentHospital}
        contactInfo={contactInfo}
        onSubmit={handleSendMedRequest}
      />

      {/* Modal 3: Target Hospital Real-time Alert & "🟢 กดรับการตามยา" Button */}
      <TargetAlertPopup
        alertRequest={activeAlertPopupRequest}
        onAccept={handleAcceptRequest}
        onComplete={handleCompleteRequest}
        onDelete={handleDeleteRequest}
        onDismiss={() => setActiveAlertPopupRequest(null)}
      />
    </div>
  );
}
