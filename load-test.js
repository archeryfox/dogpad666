// dogpad.backend/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, 
    { duration: '3m', target: 50 },  
    { duration: '1m', target: 0 },   
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], 
    http_req_failed: ['rate<0.01'],  
  },
};

const AUTH_TOKEN = 'YOUR_JWT_TOKEN';

export default function () {
  for (let i = 0; i < 7; i++) {
    const profileResponse = http.get('http://localhost:8081/profile', {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });

    check(profileResponse, {
      'profile status is 200': (r) => r.status === 200,
      'profile response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(0.1); // Small delay between requests
  }

  // Second request - /metrics (called less frequently)
  const metricsResponse = http.get('http://localhost:8081/metrics');

  check(metricsResponse, {
    'metrics status is 200': (r) => r.status === 200,
    'metrics response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1); // Wait 1 second before the next iteration
} 