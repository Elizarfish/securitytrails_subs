export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

export interface Studio {
  _id: string;
  name: string;
  description: string;
  address: string;
  pricePerHour: number;
  capacity: number;
  amenities: string[];
  images: string[];
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      isOpen: boolean;
    };
  };
  isActive: boolean;
}

export interface Booking {
  _id: string;
  user: string | User;
  studio: string | Studio;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  equipment?: Array<{
    name: string;
    price: number;
  }>;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  price: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}