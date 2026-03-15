// Central API calls
const BASE = 'http://localhost:8081/api';

export async function fetchTowns(): Promise<string[]> {
  const res = await fetch(`${BASE}/towns`);
  const data = await res.json();
  return data.towns;
}

export async function fetchNeighbors(town: string) {
  const res = await fetch(`${BASE}/neighbors?town=${encodeURIComponent(town)}`);
  return res.json();
}

export async function fetchGraph() {
  const res = await fetch(`${BASE}/graph`);
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${BASE}/stats`);
  return res.json();
}

export async function fetchShortest(from: string, to: string) {
  const res = await fetch(`${BASE}/route/shortest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  return res.json();
}

export async function fetchFastest(from: string, to: string) {
  const res = await fetch(`${BASE}/route/fastest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  return res.json();
}

export async function fetchTop3(from: string, to: string) {
  const res = await fetch(`${BASE}/route/top3?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  return res.json();
}

export async function updateEdge(source: string, target: string, distanceKm: number, travelTimeMin: number) {
  const res = await fetch(`${BASE}/edge/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, target, distanceKm, travelTimeMin }),
  });
  return res.json();
}

export async function removeEdge(source: string, target: string) {
  const res = await fetch(`${BASE}/edge/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, target }),
  });
  return res.json();
}

export async function addEdge(source: string, target: string, distanceKm: number, travelTimeMin: number) {
  const res = await fetch(`${BASE}/edge/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, target, distanceKm, travelTimeMin }),
  });
  return res.json();
}
