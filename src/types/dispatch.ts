export type DispatchRole = 'operator' | 'admin';

export type PriorityTier = 'standard' | 'expedited' | 'critical';

export type DispatchStatus = 'pending' | 'transit' | 'completed' | 'cancelled';

export type LifecycleStage = 'SUBMITTED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface SpecialHandling {
  hazmat: boolean;
  coldChain: boolean;
  highSecurity: boolean;
}

export interface DispatchTelemetry {
  temp?: string;
  tempStatus?: 'ok' | 'warning' | 'alert';
  speed?: string;
  lockedAgo?: string;
  queuePos?: number;
  podVerified?: string;
  sensorHealth?: number;
  batteryPct?: number;
  gpsCoords?: string;
}

export interface SyntheticResource {
  id: 'S101' | 'S102' | 'S103';
  name: string;
  status: 'active' | 'inactive';
  description: string;
}

export interface DispatchRequest {
  id: string;
  source: string;
  destination: string;
  carrier: string;
  priority: PriorityTier;
  status: DispatchStatus;
  lifecycleStage: LifecycleStage;
  cargo: string;
  pallets: number;
  specialHandling: SpecialHandling;
  eta: string;
  createdAt: string;
  telemetry: DispatchTelemetry;
  cost: number;
  turnaroundMinutes: number;
  baySlot: string;
  isCustom?: boolean;

  // Workflow & Master Data fields
  resourceId: string;
  contactName: string;
  contactPhone: string;
  baseValue: number;
  applicableCharge: number;
  priceSnapshot?: {
    baseValue: number;
    applicableCharge: number;
    currency: string;
    snapshotTime: string;
  };
}

export interface DockBay {
  id: string;
  name: string;
  number: number;
  status: 'occupied' | 'staging' | 'available' | 'cleaning';
  trailerId?: string;
  carrier?: string;
  cargo?: string;
  timeRemaining?: string;
  cleaningScheduled?: string;
  doorType: 'Inbound' | 'Outbound' | 'Cross-Dock';
}

export interface FleetUnit {
  id: string;
  unitNumber: string;
  driver: string;
  status: 'in-transit' | 'staged' | 'docked' | 'idle';
  location: string;
  cargo: string;
  battery: number;
  speed: number;
  temp?: number;
  route: string;
  heading: string;
  dspId?: string;
}

export interface ExceptionItem {
  id: string;
  dspId: string;
  title: string;
  type: 'cold-chain' | 'dock-hold' | 'hazmat-check' | 'delay';
  severity: 'critical' | 'high' | 'medium';
  zone: string;
  timestamp: string;
  status: 'open' | 'resolving' | 'resolved';
  description: string;
  resolutionNote?: string;
}

export interface UserSession {
  email: string;
  consoleId: string;
  name: string;
  role: DispatchRole;
  rolePill: string;
  hub: string;
  authenticated: boolean;
  workstationRemembered: boolean;
}

export interface RateEstimate {
  baseSurcharge: number;
  fuelBase: number;
  turnaroundMinutes: number;
  baySlot: string;
  weightKg: number;
}
