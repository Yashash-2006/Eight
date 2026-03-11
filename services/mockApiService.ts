
import type { CalendarEvent } from '../types';
import { HrvStatus } from '../types';

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  console.log("Mock API: Fetching calendar events...");
  await new Promise(resolve => setTimeout(resolve, 500)); 
  
  const now = new Date();
  
  // Create events relative to current time so notifications can trigger during demo
  // Event 1: Starting in 5 minutes
  const event1Start = new Date(now.getTime() + 5 * 60 * 1000);
  const event1End = new Date(event1Start.getTime() + 60 * 60 * 1000);

  // Event 2: Starting in 2 hours
  const event2Start = new Date(now.getTime() + 120 * 60 * 1000);
  const event2End = new Date(event2Start.getTime() + 30 * 60 * 1000);
  
  return [
    { title: 'Project Launch Review', startTime: event1Start.toISOString(), endTime: event1End.toISOString() },
    { title: 'Performance Sync', startTime: event2Start.toISOString(), endTime: event2End.toISOString() },
    { title: 'Client Pitch Prep', startTime: new Date(now.getTime() + 180 * 60 * 1000).toISOString(), endTime: new Date(now.getTime() + 240 * 60 * 1000).toISOString() },
  ];
};

export const addCalendarEvent = async (event: { title: string; startTime: string; endTime: string; description?: string }): Promise<{ success: boolean; message: string }> => {
  console.log("Mock API: Adding calendar event...", event);
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    success: true,
    message: `Event '${event.title}' has been successfully scheduled for ${new Date(event.startTime).toLocaleString()}.`,
  };
};

export const getHRVStatus = async (): Promise<{ status: HrvStatus }> => {
  console.log("Mock API: Fetching HRV status...");
  await new Promise(resolve => setTimeout(resolve, 500));
  const isCritical = Math.random() > 0.7; // 30% chance of being critical
  return {
    status: isCritical ? HrvStatus.CRITICAL : HrvStatus.STABLE,
  };
};

interface NotifyDoctorArgs {
    summary: string;
}

export const notifyDoctor = async (args: NotifyDoctorArgs): Promise<{ success: boolean; message: string }> => {
  console.log(`Mock API: Notifying doctor with summary: "${args.summary}"`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    success: true,
    message: `Emergency contact has been notified with the summary: "${args.summary}".`,
  };
};

export const sendEmailNotification = async (email: string, subject: string, message: string): Promise<void> => {
  console.log(`Mock API: System sending email to ${email}...`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);
  // In a real app, this would make a fetch call to a backend or use an Email API.
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("Mock API: Email sent successfully via system mailer.");
};
