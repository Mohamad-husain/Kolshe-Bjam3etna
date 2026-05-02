import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createEvent,
  deleteEvent,
  getCoordinatorDashboard,
  getEventRegistrations,
  getMyEvents,
  updateEvent,
  UpdateEventInput,
  type CreateEventInput,
} from "@/services/coordinator-api";

export const COORDINATOR_KEYS = {
  myEvents: ["coordinator", "my-events"] as const,
  dashboard: ["coordinator", "dashboard"] as const,
  registrations: (eventId: number) =>
    ["coordinator", "registrations", eventId] as const,
};

export function useMyEventsQuery() {
  return useQuery({
    queryKey: COORDINATOR_KEYS.myEvents,
    queryFn: getMyEvents,
  });
}
export function useCoordinatorDashboardQuery() {
  return useQuery({
    queryKey: COORDINATOR_KEYS.dashboard,
    queryFn: getCoordinatorDashboard,
  });
}
export function useEventRegistrationsQuery(eventId: number, enabled: boolean) {
  return useQuery({
    queryKey: COORDINATOR_KEYS.registrations(eventId),
    queryFn: () => getEventRegistrations(eventId),
    enabled,
  });
}
export function useCreateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COORDINATOR_KEYS.myEvents });
      queryClient.invalidateQueries({ queryKey: COORDINATOR_KEYS.dashboard });
    },
  });
}
export function useDeleteEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COORDINATOR_KEYS.myEvents });
      queryClient.invalidateQueries({ queryKey: COORDINATOR_KEYS.dashboard });
    },
  });
}
export function useUpdateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateEventInput) => updateEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COORDINATOR_KEYS.myEvents });
      queryClient.invalidateQueries({ queryKey: COORDINATOR_KEYS.dashboard });
    },
  });
}
