import http from 'http';
import { io } from 'socket.io-client';

async function runTests() {
  console.log('--- Starting TAMYA Automated Verification Tests ---');

  // 1. Start server locally in memory if not already running or test directly against API
  const baseUrl = 'http://localhost:4000';

  // Helper request
  const request = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const req = http.request(
        url,
        {
          method,
          headers: {
            'Content-Type': 'application/json'
          }
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, body: data });
            }
          });
        }
      );
      req.on('error', reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    // Test 1: Hospitals API
    console.log('[Test 1] Testing GET /api/hospitals...');
    const hospRes = await request('/api/hospitals');
    if (hospRes.status !== 200 || !Array.isArray(hospRes.body) || hospRes.body.length !== 9) {
      throw new Error(`Expected 9 hospitals, got: ${hospRes.body?.length}`);
    }
    console.log(`✓ Passed: Found all 9 hospitals in Sukhothai: ${hospRes.body.map(h => h.shortName).join(', ')}`);

    // Test 2: Create Request from รพ.สุโขทัย to รพ.สวรรคโลก
    console.log('[Test 2] Testing POST /api/requests (รพ.สุโขทัย -> รพ.สวรรคโลก)...');
    const newReqPayload = {
      patientName: 'นางสาวดวงใจ รักษาดี',
      patientHN: 'HN-998877',
      patientCID: '1649900112233',
      sourceHospitalId: 'sukhothai',
      targetHospitalId: 'sawankhalok',
      urgency: 'urgent',
      medicationDetails: 'ขอประวัติยากันชัก และประวัติการแพ้ยา Carbamazepine ด่วนมาก คนไข้ชักซ้ำที่ ER',
      contactPerson: 'ภก.อดิศร ใจเย็น',
      contactPhone: '055-611800 ต่อ 1204',
      contactDirectPhone: '089-111-2233',
      contactLineId: '@sukhothai_rx'
    };

    const createRes = await request('/api/requests', 'POST', newReqPayload);
    if (createRes.status !== 201 || !createRes.body.id) {
      throw new Error(`Failed to create request: ${JSON.stringify(createRes)}`);
    }
    const createdId = createRes.body.id;
    console.log(`✓ Passed: Request created successfully with ID: ${createdId}, status: ${createRes.body.status}`);

    // Test 3: Accept Request by รพ.สวรรคโลก ("🟢 กดรับการตามยา")
    console.log('[Test 3] Testing PATCH /api/requests/:id/accept ("กดรับการตามยา")...');
    const acceptRes = await request(`/api/requests/${createdId}/accept`, 'PATCH', {
      acceptedBy: 'ภญ.นภาพร ศรีสวรรค์'
    });
    if (acceptRes.status !== 200 || acceptRes.body.status !== 'accepted') {
      throw new Error(`Failed to accept request: ${JSON.stringify(acceptRes)}`);
    }
    console.log(`✓ Passed: Target hospital accepted request! status: ${acceptRes.body.status}, acceptedBy: ${acceptRes.body.acceptedBy}`);

    // Test 4: Complete Request ("✅ ส่งประวัติยาเรียบร้อย")
    console.log('[Test 4] Testing PATCH /api/requests/:id/complete ("ส่งประวัติยาแล้ว")...');
    const completeRes = await request(`/api/requests/${createdId}/complete`, 'PATCH', {
      completionNote: 'โทรแจ้งประวัติยากับ ภก.อดิศร แล้ว และส่งรูปสรุปทาง LINE'
    });
    if (completeRes.status !== 200 || completeRes.body.status !== 'completed') {
      throw new Error(`Failed to complete request: ${JSON.stringify(completeRes)}`);
    }
    console.log(`✓ Passed: Request completed successfully! status: ${completeRes.body.status}`);

    console.log('\n=== ALL 4 AUTOMATED API & FLOW TESTS PASSED! ===\n');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTests();

