export type LabStatus = 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type UserRole = 'student' | 'admin';

export interface Equipment {
  id: string;
  name: string;
  quantity: number;
}

export interface Lab {
  id: string;
  name: string;
  location: string;
  building: string;
  capacity: number;
  status: LabStatus;
  faculty: string;
  description: string;
  equipment: Equipment[];
  isOccupied?: boolean;
}

export interface Booking {
  id: string;
  labId: string;
  labName: string;
  labLocation: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentFaculty: string;
  date: string;
  timeSlot: TimeSlot;
  purpose: string;
  status: BookingStatus;
  createdAt: string;
  note?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  faculty?: string;
  department?: string;
  studentId?: string;
  staffId?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  createdAt: string;
  isRead: boolean;
}

export const labs: Lab[] = [
  {
    id: 'lab-1',
    name: 'Computer Science Lab A',
    location: 'Block C, Level 2, Room C201',
    building: 'Block C',
    capacity: 30,
    status: 'ACTIVE',
    faculty: 'Computer Science & IT',
    description:
      'A modern computing lab equipped with high-performance workstations for programming, data analysis, and software development courses.',
    equipment: [
      { id: 'eq-1-1', name: 'Desktop Computers (Intel i7)', quantity: 30 },
      { id: 'eq-1-2', name: 'Dual Monitor Setup', quantity: 30 },
      { id: 'eq-1-3', name: 'High-Speed Internet (1 Gbps)', quantity: 1 },
      { id: 'eq-1-4', name: 'Laser Printer (B&W)', quantity: 2 },
      { id: 'eq-1-5', name: 'Projector (4K)', quantity: 1 },
      { id: 'eq-1-6', name: 'Smart Whiteboard', quantity: 1 },
    ],
  },
  {
    id: 'lab-2',
    name: 'Electronics & Circuits Lab',
    location: 'Block E, Level 1, Room E105',
    building: 'Block E',
    capacity: 24,
    status: 'ACTIVE',
    faculty: 'Electrical Engineering',
    description:
      'Fully equipped electronics lab for circuit design, PCB fabrication, and embedded systems development.',
    equipment: [
      { id: 'eq-2-1', name: 'Oscilloscope', quantity: 12 },
      { id: 'eq-2-2', name: 'Function Generator', quantity: 12 },
      { id: 'eq-2-3', name: 'Digital Multimeter', quantity: 24 },
      { id: 'eq-2-4', name: 'Soldering Station', quantity: 12 },
      { id: 'eq-2-5', name: 'Power Supply Unit (DC)', quantity: 24 },
      { id: 'eq-2-6', name: 'Breadboard & Component Kit', quantity: 24 },
    ],
    isOccupied: true,
  },
  {
    id: 'lab-3',
    name: 'Physics Research Lab',
    location: 'Block P, Level 3, Room P301',
    building: 'Block P',
    capacity: 20,
    status: 'ACTIVE',
    faculty: 'Applied Sciences',
    description:
      'State-of-the-art physics lab for experimental research in optics, mechanics, thermodynamics, and wave phenomena.',
    equipment: [
      { id: 'eq-3-1', name: 'Spectrometer', quantity: 4 },
      { id: 'eq-3-2', name: 'Laser Source (Multi-wavelength)', quantity: 6 },
      { id: 'eq-3-3', name: 'Precision Balance', quantity: 5 },
      { id: 'eq-3-4', name: 'Optical Bench', quantity: 4 },
      { id: 'eq-3-5', name: 'Oscilloscope', quantity: 4 },
      { id: 'eq-3-6', name: 'Data Logger', quantity: 10 },
    ],
  },
  {
    id: 'lab-4',
    name: 'Network & Cybersecurity Lab',
    location: 'Block C, Level 4, Room C401',
    building: 'Block C',
    capacity: 20,
    status: 'ACTIVE',
    faculty: 'Computer Science & IT',
    description:
      'Isolated network environment for learning network configuration, ethical hacking, penetration testing, and cybersecurity practices.',
    equipment: [
      { id: 'eq-4-1', name: 'Cisco Routers & Switches', quantity: 10 },
      { id: 'eq-4-2', name: 'Firewall Appliances', quantity: 4 },
      { id: 'eq-4-3', name: 'Kali Linux Workstations', quantity: 20 },
      { id: 'eq-4-4', name: 'Network Analyzer (Wireshark)', quantity: 20 },
      { id: 'eq-4-5', name: 'NAS Storage Server', quantity: 2 },
    ],
  },
  {
    id: 'lab-5',
    name: 'Biotechnology Lab',
    location: 'Block B, Level 2, Room B215',
    building: 'Block B',
    capacity: 16,
    status: 'MAINTENANCE',
    faculty: 'Life Sciences',
    description:
      'Advanced biotechnology lab for molecular biology experiments, DNA analysis, and cell culture research.',
    equipment: [
      { id: 'eq-5-1', name: 'PCR Machine', quantity: 4 },
      { id: 'eq-5-2', name: 'Centrifuge', quantity: 6 },
      { id: 'eq-5-3', name: 'Gel Electrophoresis System', quantity: 4 },
      { id: 'eq-5-4', name: 'Biosafety Cabinet', quantity: 2 },
      { id: 'eq-5-5', name: 'Microscope (400x)', quantity: 8 },
      { id: 'eq-5-6', name: 'Spectrophotometer', quantity: 3 },
    ],
  },
];

export const studentUser: AppUser = {
  id: 'student-1',
  name: 'Aisha Rahman',
  email: 'aisha.rahman@student.uni.edu',
  role: 'student',
  faculty: 'Computer Science & IT',
  department: 'Software Engineering',
  studentId: 'CS/2023/0142',
};

export const adminUser: AppUser = {
  id: 'admin-1',
  name: 'Dr. Marcus Lim',
  email: 'marcus.lim@uni.edu',
  role: 'admin',
  faculty: 'Computer Science & IT',
  department: 'Computer Networks',
  staffId: 'STF/2015/0023',
};

export const bookings: Booking[] = [
  {
    id: 'bk-1',
    labId: 'lab-1',
    labName: 'Computer Science Lab A',
    labLocation: 'Block C, Level 2',
    studentId: 'student-1',
    studentName: 'Aisha Rahman',
    studentEmail: 'aisha.rahman@student.uni.edu',
    studentFaculty: 'Computer Science & IT',
    date: '2026-03-15',
    timeSlot: 'morning',
    purpose: 'Final year project development – web application prototype',
    status: 'APPROVED',
    createdAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 'bk-2',
    labId: 'lab-4',
    labName: 'Network & Cybersecurity Lab',
    labLocation: 'Block C, Level 4',
    studentId: 'student-1',
    studentName: 'Aisha Rahman',
    studentEmail: 'aisha.rahman@student.uni.edu',
    studentFaculty: 'Computer Science & IT',
    date: '2026-03-18',
    timeSlot: 'afternoon',
    purpose: 'Networking assignment – VPN configuration lab',
    status: 'PENDING',
    createdAt: '2026-03-11T14:30:00Z',
  },
  {
    id: 'bk-3',
    labId: 'lab-3',
    labName: 'Physics Research Lab',
    labLocation: 'Block P, Level 3',
    studentId: 'student-1',
    studentName: 'Aisha Rahman',
    studentEmail: 'aisha.rahman@student.uni.edu',
    studentFaculty: 'Computer Science & IT',
    date: '2026-03-08',
    timeSlot: 'evening',
    purpose: 'Cross-faculty elective – optics experiment',
    status: 'REJECTED',
    createdAt: '2026-03-05T11:00:00Z',
    note: 'Lab reserved for Faculty of Applied Sciences students only during this period.',
  },
  {
    id: 'bk-4',
    labId: 'lab-1',
    labName: 'Computer Science Lab A',
    labLocation: 'Block C, Level 2',
    studentId: 'student-2',
    studentName: 'Wei Xian Tan',
    studentEmail: 'weixian.tan@student.uni.edu',
    studentFaculty: 'Computer Science & IT',
    date: '2026-03-14',
    timeSlot: 'morning',
    purpose: 'Machine learning model training – deep learning project',
    status: 'PENDING',
    createdAt: '2026-03-12T08:15:00Z',
  },
  {
    id: 'bk-5',
    labId: 'lab-4',
    labName: 'Network & Cybersecurity Lab',
    labLocation: 'Block C, Level 4',
    studentId: 'student-3',
    studentName: 'Priya Nair',
    studentEmail: 'priya.nair@student.uni.edu',
    studentFaculty: 'Computer Science & IT',
    date: '2026-03-16',
    timeSlot: 'afternoon',
    purpose: 'Cybersecurity capstone – firewall configuration and testing',
    status: 'PENDING',
    createdAt: '2026-03-12T10:00:00Z',
  },
  {
    id: 'bk-6',
    labId: 'lab-1',
    labName: 'Computer Science Lab A',
    labLocation: 'Block C, Level 2',
    studentId: 'student-4',
    studentName: 'Raj Kumar',
    studentEmail: 'raj.kumar@student.uni.edu',
    studentFaculty: 'Computer Science & IT',
    date: '2026-03-17',
    timeSlot: 'evening',
    purpose: 'Database design project – SQL schema and queries',
    status: 'APPROVED',
    createdAt: '2026-03-09T16:45:00Z',
  },
  {
    id: 'bk-7',
    labId: 'lab-3',
    labName: 'Physics Research Lab',
    labLocation: 'Block P, Level 3',
    studentId: 'student-5',
    studentName: 'Fatima Al-Hassan',
    studentEmail: 'fatima.alhassan@student.uni.edu',
    studentFaculty: 'Applied Sciences',
    date: '2026-03-13',
    timeSlot: 'morning',
    purpose: 'Optics research – diffraction grating experiments',
    status: 'PENDING',
    createdAt: '2026-03-11T13:20:00Z',
  },
  {
    id: 'bk-8',
    labId: 'lab-2',
    labName: 'Electronics & Circuits Lab',
    labLocation: 'Block E, Level 1',
    studentId: 'student-6',
    studentName: 'Liam Okafor',
    studentEmail: 'liam.okafor@student.uni.edu',
    studentFaculty: 'Electrical Engineering',
    date: '2026-03-19',
    timeSlot: 'morning',
    purpose: 'Embedded systems lab – Arduino microcontroller programming',
    status: 'REJECTED',
    createdAt: '2026-03-10T11:00:00Z',
    note: 'Time slot already reserved. Please select another slot.',
  },
];

export const studentNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'student-1',
    title: 'Booking Approved',
    message: 'Your booking for Computer Science Lab A on Mar 15 (Morning) has been approved.',
    type: 'success',
    createdAt: '2026-03-11T10:30:00Z',
    isRead: false,
  },
  {
    id: 'notif-2',
    userId: 'student-1',
    title: 'Booking Rejected',
    message: 'Your booking for Physics Research Lab on Mar 8 was rejected. Reason: Reserved for Applied Sciences only.',
    type: 'error',
    createdAt: '2026-03-06T09:00:00Z',
    isRead: true,
  },
  {
    id: 'notif-3',
    userId: 'student-1',
    title: 'Session Reminder',
    message: 'You have an upcoming session in Computer Science Lab A tomorrow at 8:00 AM. Please arrive on time.',
    type: 'info',
    createdAt: '2026-03-14T18:00:00Z',
    isRead: false,
  },
  {
    id: 'notif-4',
    userId: 'student-1',
    title: 'Lab Available Again',
    message: 'Biotechnology Lab is back online after maintenance. Reservations are now open.',
    type: 'info',
    createdAt: '2026-03-10T08:00:00Z',
    isRead: true,
  },
  {
    id: 'notif-5',
    userId: 'student-1',
    title: 'Booking Under Review',
    message: 'Your booking for Network & Cybersecurity Lab on Mar 18 is pending approval by admin.',
    type: 'warning',
    createdAt: '2026-03-11T14:35:00Z',
    isRead: false,
  },
];

export const adminNotifications: AppNotification[] = [
  {
    id: 'anotif-1',
    userId: 'admin-1',
    title: '3 Pending Requests',
    message: 'There are 3 new lab reservation requests awaiting your review and approval.',
    type: 'warning',
    createdAt: '2026-03-12T09:00:00Z',
    isRead: false,
  },
  {
    id: 'anotif-2',
    userId: 'admin-1',
    title: 'Maintenance Complete',
    message: 'Biotechnology Lab maintenance has been completed. Status updated to available.',
    type: 'success',
    createdAt: '2026-03-10T14:00:00Z',
    isRead: true,
  },
  {
    id: 'anotif-3',
    userId: 'admin-1',
    title: 'System Update',
    message: 'UniLab reservation system has been updated to version 2.4.1. Check changelog for details.',
    type: 'info',
    createdAt: '2026-03-08T08:00:00Z',
    isRead: true,
  },
  {
    id: 'anotif-4',
    userId: 'admin-1',
    title: 'Capacity Alert',
    message: 'Computer Science Lab A has been booked for 5 consecutive sessions. Consider scheduling maintenance.',
    type: 'warning',
    createdAt: '2026-03-09T11:00:00Z',
    isRead: false,
  },
];

export const timeSlotLabels: Record<TimeSlot, { label: string; time: string }> = {
  morning: { label: 'Morning', time: '8:00 AM – 12:00 PM' },
  afternoon: { label: 'Afternoon', time: '1:00 PM – 5:00 PM' },
  evening: { label: 'Evening', time: '6:00 PM – 10:00 PM' },
};
