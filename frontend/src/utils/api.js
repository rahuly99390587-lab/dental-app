// All API calls go through this file.
// BASE URL is configurable via environment variable.
const BASE_URL =
  process.env.REACT_APP_API_URL || "https://dental-backend-3kfz.onrender.com/api";

// ─── Generic request helper ───────────────────────────────────────────────────
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkErr) {
    throw new Error(
      'Cannot reach the server. Please check your connection and try again.'
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Server returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// ─── Slot API ─────────────────────────────────────────────────────────────────

/**
 * Fetch available slots for a given date.
 * @param {string} date - ISO date string: YYYY-MM-DD
 * @returns {Promise<Array>} Array of slot objects
 */
export async function fetchSlots(date) {
  if (!date) throw new Error('Date is required to fetch slots.');
  const data = await request(`/patients/slots?date=${encodeURIComponent(date)}`);
  return data.slots || [];
}

// ─── Booking API ──────────────────────────────────────────────────────────────

/**
 * Create a new appointment booking.
 * @param {{ name, mobile, date, slot, problem }} payload
 * @returns {Promise<Object>} Booking confirmation data
 */
export async function createBooking(payload) {
  const data = await request('/booking', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

// ─── Admin API ────────────────────────────────────────────────────────────────

/**
 * Fetch all patients, optionally filtered by date or search term.
 * @param {{ date?, search? }} params
 */
export async function fetchPatients(params = {}) {
  const qs = new URLSearchParams();
  if (params.date)   qs.set('date',   params.date);
  if (params.search) qs.set('search', params.search);
  const query = qs.toString() ? `?${qs}` : '';
  const data = await request(`/patients${query}`);
  return data;
}

/**
 * Fetch patients booked for today.
 */
export async function fetchTodayPatients() {
  const data = await request('/patients/today');
  return data;
}

/**
 * Fetch dashboard statistics.
 */
export async function fetchStats() {
  const data = await request('/patients/stats');
  return data.data;
}

/**
 * Delete all bookings for a given mobile number.
 * @param {string} mobile - 10-digit mobile
 */
export async function deletePatient(mobile) {
  const data = await request(`/patients/${mobile}`, { method: 'DELETE' });
  return data;
}
