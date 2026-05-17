const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map((d) => d.msg || d).join(', ')
      : data.detail || data.message || 'İstek başarısız';
    throw new Error(detail);
  }

  return data;
}

export async function fetchAiStatus() {
  return request('/ai-status');
}

export async function uploadData(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request('/upload-data', { method: 'POST', body: formData });
}

export async function analyze(operationId) {
  return request(`/analyze?operation_id=${operationId}`, { method: 'POST' });
}

export async function applySuggestion(operationId, suggestionId) {
  return request('/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation_id: operationId, suggestion_id: suggestionId }),
  });
}

export async function fetchSampleData() {
  return request('/sample-data');
}

export async function healthCheck() {
  return request('/health');
}

export async function askCopilot(operationId, query) {
  return request('/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation_id: operationId, query }),
  });
}
