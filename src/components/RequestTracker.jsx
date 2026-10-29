import React, { useState } from 'react';
import {
  Inbox,
  Send,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Phone,
  Eye,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import HospitalLogo from './HospitalLogo';

export default function RequestTracker({
  requests = [],
  currentHospital,
  onOpenAlert,
  onAcceptRequest,
  onCompleteRequest,
  onDeleteRequest,
  onClearAllRequests
}) {
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const incomingRequests = requests.filter(
    (r) => r.targetHospitalId === currentHospital?.id
  );
  const outgoingRequests = requests.filter(
    (r) => r.sourceHospitalId === currentHospital?.id
  );

  const getFilteredList = () => {
    let list = [];
    if (activeTab === 'incoming') list = incomingRequests;
    else if (activeTab === 'outgoing') list = outgoingRequests;
    else list = requests;

    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.sourceHospitalName.toLowerCase().includes(q) ||
          r.targetHospitalName.toLowerCase().includes(q) ||
          (r.contactPerson && r.contactPerson.toLowerCase().includes(q))
      );
    }

    return list;
  };

  const filtered = getFilteredList();

  const getUrgencyBadge = (urgency) => {
    if (urgency === 'urgent') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          🚨 ด่วนวิกฤต
        </span>
      );
    }
    if (urgency === 'high') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          ⚠️ ด่วน
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        ปกติ
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'accepted') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Clock className="w-3 h-3 text-blue-600 animate-spin" />
          รับเรื่องแล้ว
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          ส่งประวัติยาแล้ว
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
        <AlertCircle className="w-3 h-3 text-amber-500" />
        รอ รพ.ปลายทางตอบรับ
      </span>
    );
  };

  const handleDelete = (id, hospitalName) => {
    if (window.confirm(`ต้องการลบรายการแจ้งเตือนจาก "${hospitalName}" ใช่หรือไม่?`)) {
      onDeleteRequest(id);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('คุณต้องการ "ล้างสถานะการตามยาทั้งหมด" ใช่หรือไม่?')) {
      onClearAllRequests();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header Tabs & Actions */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'incoming'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>การตามยาที่ส่งถึงเรา (Incoming)</span>
              {incomingRequests.filter((r) => r.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] rounded-full font-bold">
                  {incomingRequests.filter((r) => r.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('outgoing')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'outgoing'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>การตามยาที่เราส่งไป (Outgoing)</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full">
                {outgoingRequests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>ทั้งเครือข่ายสุโขทัย</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full">
                {requests.length}
              </span>
            </button>
          </div>

          {/* Search, Filter & Clear All Status Button */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อ รพ. หรือผู้ประสานงาน..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="accepted">รับเรื่องแล้ว</option>
              <option value="completed">ส่งประวัติยาแล้ว</option>
            </select>

            {/* ปุ่มล้างสถานะการตามทั้งหมด */}
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-2xs"
              title="ล้างข้อมูลสถานะการตามยาทั้งหมดในระบบ"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>ล้างสถานะทั้งหมด</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">ไม่พบรายการแจ้งเตือนตามยาในหมวดนี้</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-bold">เวลา</th>
                <th className="py-3 px-4 font-bold">ระดับ</th>
                <th className="py-3 px-4 font-bold">รพ.ต้นทางผู้ขอ</th>
                <th className="py-3 px-4 font-bold">รพ.ปลายทาง</th>
                <th className="py-3 px-4 font-bold">ช่องทางติดต่อกลับ</th>
                <th className="py-3 px-4 font-bold">สถานะ</th>
                <th className="py-3 px-4 font-bold text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const isTargetOfThis = item.targetHospitalId === currentHospital?.id;
                const isSourceOfThis = item.sourceHospitalId === currentHospital?.id;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition ${
                      item.status === 'pending' && isTargetOfThis ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Time */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      <div>
                        {new Date(item.createdAt).toLocaleDateString('th-TH', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </div>
                      <div className="font-semibold text-slate-700">
                        {new Date(item.createdAt).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} น.
                      </div>
                    </td>

                    {/* Urgency */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getUrgencyBadge(item.urgency)}
                    </td>

                    {/* Source Hospital */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <HospitalLogo hospitalId={item.sourceHospitalId} size={28} />
                        <div>
                          <div className="font-bold text-slate-800">
                            {item.sourceHospitalName}
                          </div>
                          {isSourceOfThis && (
                            <span className="text-[10px] text-blue-600 font-bold">
                              (รพ. ของท่าน)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Target Hospital */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <HospitalLogo hospitalId={item.targetHospitalId} size={28} />
                        <div>
                          <div className="font-bold text-slate-800">
                            {item.targetHospitalName}
                          </div>
                          {isTargetOfThis && (
                            <span className="text-[10px] text-emerald-600 font-bold">
                              (รพ. ของท่าน)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Requester Contact Channels */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-semibold">{item.contactPerson}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{item.contactPhone}</span>
                      </div>
                      {item.contactLineId && (
                        <div className="text-[10px] text-emerald-700 font-medium">
                          LINE: {item.contactLineId}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Target hospital action: "🟢 กดรับการตามยา" */}
                        {isTargetOfThis && item.status === 'pending' && (
                          <button
                            onClick={() => onAcceptRequest(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            🟢 กดรับการตามยา
                          </button>
                        )}

                        {isTargetOfThis && item.status === 'accepted' && (
                          <button
                            onClick={() => onCompleteRequest(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-sm transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            ✅ ส่งประวัติยาแล้ว
                          </button>
                        )}

                        {/* View Details modal */}
                        <button
                          onClick={() => onOpenAlert(item)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="ดูรายละเอียดช่องทางติดต่อกลับ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(item.id, item.sourceHospitalName)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-transparent hover:border-rose-200 transition"
                          title="ลบสถานะรายการนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
