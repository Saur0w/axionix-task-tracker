import { User, Project, Task } from "@/types";

export const INITIAL_USERS: User[] = [
    {
        id: 'user-1',
        name: 'Saurabh Thapliyal',
        email: 'sthap@axionix.dev',
        role: 'Frontend Developer Intern',
        avatarUrl: '',
    },
    {
        id: 'user-2',
        name: 'John Doe',
        email: 'jdoe@example.com',
        role: 'Product Designer',
        avatarUrl: '',
    },
    {
        id: 'user-3',
        name: 'Asta',
        email: 'asta@axionix.dev',
        role: 'Product Designer',
        avatarUrl: ''
    }
];

export const INITIAL_PROJECTS: Project[] = [
    {
        id: 'proj-1',
        name: 'Axionix Web Platform',
        description: 'Next-gen task tracker with Linear aesthetics, dark mode, and real-time updates.',
        memberIds: ['user-1', 'user-2', 'user-3'],
        createdAt: '2026-09-15T10:00:00Z',
    },
    {
        id: 'proj-2',
        name: 'Core Engine & API',
        description: 'High-throughput microservices, telemetry pipeline, and authentication backend.',
        memberIds: ['user-1', 'user-3'],
        createdAt: '2026-09-20T14:30:00Z',
    },
    {
        id: 'proj-3',
        name: 'Mobile App Experience',
        description: 'Native iOS & Android productivity companion built with React Native.',
        memberIds: ['user-2'],
        createdAt: '2026-09-28T09:15:00Z',
    },
];

export const INITIAL_TASKS: Task[] = [
    {
        id: 'task-1',
        projectId: 'proj-1',
        title: 'Optimize API response latency for dashboard analytics',
        description: 'Render UI before vehicle_state sync when minimum required state is present.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigneeId: 'user-1',
        dueDate: '2026-10-05',
        createdAt: '2026-09-29T10:00:00Z',
        updatedAt: '2026-10-01T12:00:00Z',
    },
    {
        id: 'task-2',
        projectId: 'proj-1',
        title: 'Implement OAuth2 session refresh with JWT rotation',
        description: 'Ensure seamless token refresh on expired session cookies with exponential backoff.',
        status: 'TODO',
        priority: 'HIGH',
        assigneeId: 'user-3',
        dueDate: '2026-10-08',
        createdAt: '2026-09-30T11:00:00Z',
        updatedAt: '2026-09-30T11:00:00Z',
    },
    {
        id: 'task-3',
        projectId: 'proj-1',
        title: 'Design system tokens and responsive header revamp',
        description: 'Fine-tune typography, micro-radii, and subtle border highlights.',
        status: 'DONE',
        priority: 'MEDIUM',
        assigneeId: 'user-1',
        dueDate: '2026-10-02',
        createdAt: '2026-09-28T09:00:00Z',
        updatedAt: '2026-10-02T13:00:00Z',
    },
    {
        id: 'task-4',
        projectId: 'proj-1',
        title: 'Keyboard shortcut navigation (Cmd+K command menu)',
        description: 'Support quick task jumps, global search, and hotkeys (C to create).',
        status: 'TODO',
        priority: 'MEDIUM',
        assigneeId: 'user-1',
        dueDate: '2026-10-10',
        createdAt: '2026-10-01T15:00:00Z',
        updatedAt: '2026-10-01T15:00:00Z',
    },
    {
        id: 'task-5',
        projectId: 'proj-2',
        title: 'Database connection pooling and query optimization',
        description: 'Prevent connection starvation under simulated spike load.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigneeId: 'user-3',
        dueDate: '2026-10-07',
        createdAt: '2026-09-27T08:00:00Z',
        updatedAt: '2026-10-01T16:00:00Z',
    },
    {
        id: 'task-6',
        projectId: 'proj-3',
        title: 'Offline task synchronization with IndexedDB cache',
        description: 'Queue local mutations when connection drops and flush upon reconnect.',
        status: 'TODO',
        priority: 'LOW',
        assigneeId: 'user-2',
        dueDate: '2026-10-15',
        createdAt: '2026-10-02T10:00:00Z',
        updatedAt: '2026-10-02T10:00:00Z',
    },
];