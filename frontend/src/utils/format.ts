import { format, formatDistance } from 'date-fns';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'h:mm a');
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    scheduled: '#6b7280',
    assigned: '#3b82f6',
    reported: '#8b5cf6',
    completed: '#10b981',
    cancelled: '#ef4444',
    pending: '#f59e0b',
    accepted: '#3b82f6',
    picked_up: '#8b5cf6',
    delivered: '#10b981',
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  };

  return statusColors[status] || '#6b7280';
}

export function getStatusLabel(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
