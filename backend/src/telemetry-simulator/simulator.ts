import axios from 'axios';

type LoginResponse = {
  accessToken: string;
};

type Machine = {
  id: number;
  code: string;
};

const apiUrl = process.env.SIMULATOR_API_URL || 'http://localhost:3001/api';
const email = process.env.SIMULATOR_EMAIL || 'demo@workmeter.com';
const password = process.env.SIMULATOR_PASSWORD || 'Demo123456';
const intervalMs = Number(process.env.SIMULATOR_INTERVAL_MS || 5000);

function randomReading() {
  const mode = Math.random();

  if (mode < 0.45) {
    return {
      vibrationValue: Number((0.6 + Math.random() * 1.2).toFixed(4)),
      energyConsumption: Number((6 + Math.random() * 20).toFixed(4)),
    };
  }

  if (mode < 0.8) {
    return {
      vibrationValue: Number((Math.random() * 0.3).toFixed(4)),
      energyConsumption: Number((Math.random() * 3).toFixed(4)),
    };
  }

  return {
    vibrationValue: Number((Math.random() * 0.4).toFixed(4)),
    energyConsumption: Number((6 + Math.random() * 12).toFixed(4)),
  };
}

async function main() {
  const login = await axios.post<LoginResponse>(`${apiUrl}/auth/login`, { email, password });
  const token = login.data.accessToken;
  const client = axios.create({
    baseURL: apiUrl,
    headers: { Authorization: `Bearer ${token}` },
  });

  const machinesResponse = await client.get<Machine[]>('/machines');
  const machines = machinesResponse.data;

  if (machines.length === 0) {
    throw new Error('No machines found. Run prisma seed or create a machine first.');
  }

  console.log(`Telemetry simulator started for ${machines.length} machines.`);

  setInterval(async () => {
    const machine = machines[Math.floor(Math.random() * machines.length)];
    const reading = randomReading();

    try {
      await client.post('/telemetry', {
        machineId: machine.id,
        ...reading,
        timestamp: new Date().toISOString(),
      });
      console.log(`Sent telemetry to ${machine.code}:`, reading);
    } catch (error) {
      console.error('Telemetry request failed:', error instanceof Error ? error.message : error);
    }
  }, intervalMs);
}

void main();
