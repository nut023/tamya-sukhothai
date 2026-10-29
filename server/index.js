import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

const HOSPITALS_FILE = path.join(__dirname, 'data', 'hospitals.json');
const REQUESTS_FILE = path.join(__dirname, 'data', 'requests.json');

// Read hospitals
function getHospitals() {
  try {
    const raw = fs.readFileSync(HOSPITALS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading hospitals.json', err);
    return [];
  }
}

// Read requests
function getRequests() {
  try {
    if (!fs.existsSync(REQUESTS_FILE)) {
      fs.writeFileSync(REQUESTS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(REQUESTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading requests.json', err);
    return [];
  }
}

// Save requests
function saveRequests(requests) {
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving requests.json', err);
  }
}

// Initialize seed sample data if empty
let requests = getRequests();
if (requests.length === 0) {
  const hospitals = getHospitals();
  const sample = [
    {
      id: 'req-' + Date.now(),
      patientName: 'นายสมชาย มั่นคง',
      patientHN: 'HN-650421',
      patientCID: '1640100234567',
      sourceHospitalId: 'sawankhalok',
      sourceHospitalName: 'โรงพยาบาลสวรรคโลก',
      targetHospitalId: 'sukhothai',
      targetHospitalName: 'โรงพยาบาลสุโขทัย',
      urgency: 'high', // 'urgent' | 'high' | 'normal'
      medicationDetails: 'ขอประวัติยาโรคเบาหวาน ความดันโลหิตสูง และประวัติการใช้ยาฉีดอินซูลินเดิม ผู้ป่วยหมดสติมาที่ ER',
      contactPerson: 'ภก.สิทธิชัย ดวงดี',
      contactPhone: '055-641951 ต่อ 108',
      contactDirectPhone: '081-987-6543',
      contactLineId: '@swk_rx_urgent',
      status: 'pending', // 'pending' | 'accepted' | 'completed' | 'cancelled'
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      acceptedAt: null,
      acceptedBy: null,
      notes: 'ผู้ป่วยจำประวัติยาเดิมไม่ได้ ญาติแจ้งว่าเพิ่งรับยาจาก รพ.สุโขทัย เมื่อสัปดาห์ก่อน'
    }
  ];
  saveRequests(sample);
  requests = sample;
}

// REST Endpoints
app.get('/api/hospitals', (req, res) => {
  res.json(getHospitals());
});

app.get('/api/requests', (req, res) => {
  const data = getRequests();
  res.json(data);
});

// Create new tracking request
app.post('/api/requests', (req, res) => {
  const {
    patientName,
    patientHN,
    patientCID,
    sourceHospitalId,
    targetHospitalId,
    urgency = 'normal',
    medicationDetails,
    contactPerson,
    contactPhone,
    contactDirectPhone,
    contactLineId,
    notes = ''
  } = req.body;

  const hospitals = getHospitals();
  const sourceHosp = hospitals.find(h => h.id === sourceHospitalId);
  const targetHosp = hospitals.find(h => h.id === targetHospitalId);

  if (!sourceHosp || !targetHosp) {
    return res.status(400).json({ error: 'ไม่พบโรงพยาบาลต้นทางหรือปลายทาง' });
  }

  const newRequest = {
    id: 'req-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    patientName: patientName || 'ไม่ระบุชื่อ',
    patientHN: patientHN || '-',
    patientCID: patientCID || '-',
    sourceHospitalId,
    sourceHospitalName: sourceHosp.name,
    targetHospitalId,
    targetHospitalName: targetHosp.name,
    urgency, // 'urgent' | 'high' | 'normal'
    medicationDetails: medicationDetails || 'ขอประวัติยาทั้งหมดและการแพ้ยา',
    contactPerson: contactPerson || 'ห้องยา/งานเภสัชกรรม',
    contactPhone: contactPhone || sourceHosp.phone,
    contactDirectPhone: contactDirectPhone || sourceHosp.directLine,
    contactLineId: contactLineId || sourceHosp.defaultLineId,
    status: 'pending', // 'pending' | 'accepted' | 'completed'
    createdAt: new Date().toISOString(),
    acceptedAt: null,
    acceptedBy: null,
    notes
  };

  const list = getRequests();
  list.unshift(newRequest);
  saveRequests(list);

  // Broadcast via Socket.io
  // 1. Emit to target hospital room
  io.to(`hospital:${targetHospitalId}`).emit('new-request-alert', newRequest);
  // 2. Emit global update to all connected clients
  io.emit('requests-updated', list);

  res.status(201).json(newRequest);
});

// Accept request by target hospital ("กดรับการตามยา")
app.patch('/api/requests/:id/accept', (req, res) => {
  const { id } = req.params;
  const { acceptedBy = 'เจ้าหน้าที่เภสัชกรรม' } = req.body;

  const list = getRequests();
  const index = list.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'ไม่พบคำขอนี้' });
  }

  const reqItem = list[index];
  reqItem.status = 'accepted';
  reqItem.acceptedAt = new Date().toISOString();
  reqItem.acceptedBy = acceptedBy;

  saveRequests(list);

  // Notify source hospital and all clients
  io.to(`hospital:${reqItem.sourceHospitalId}`).emit('request-accepted-alert', reqItem);
  io.emit('requests-updated', list);

  res.json(reqItem);
});

// Complete request
app.patch('/api/requests/:id/complete', (req, res) => {
  const { id } = req.params;
  const { completionNote = 'ส่งประวัติยาให้ รพ.ต้นทางเรียบร้อยแล้ว' } = req.body;

  const list = getRequests();
  const index = list.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'ไม่พบคำขอนี้' });
  }

  const reqItem = list[index];
  reqItem.status = 'completed';
  reqItem.completedAt = new Date().toISOString();
  reqItem.completionNote = completionNote;

  saveRequests(list);

  io.to(`hospital:${reqItem.sourceHospitalId}`).emit('request-completed-alert', reqItem);
  io.emit('requests-updated', list);

  res.json(reqItem);
});

// Delete or cancel single request
app.delete('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  let list = getRequests();
  list = list.filter(r => r.id !== id);
  saveRequests(list);
  io.emit('requests-updated', list);
  res.json({ success: true, message: 'ลบรายการสำเร็จ' });
});

// Clear all requests ("ล้างสถานะการตามทั้งหมด")
app.delete('/api/requests', (req, res) => {
  saveRequests([]);
  io.emit('requests-updated', []);
  res.json({ success: true, message: 'ล้างสถานะการตามยาทั้งหมดเรียบร้อยแล้ว' });
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Client joins their hospital room to receive targeted alerts
  socket.on('join-hospital', (hospitalId) => {
    socket.join(`hospital:${hospitalId}`);
    console.log(`Socket ${socket.id} joined hospital room: hospital:${hospitalId}`);
  });

  socket.on('leave-hospital', (hospitalId) => {
    socket.leave(`hospital:${hospitalId}`);
    console.log(`Socket ${socket.id} left hospital room: hospital:${hospitalId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve static build from dist if available
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`TAMYA Realtime Server running on port ${PORT}`);
});
