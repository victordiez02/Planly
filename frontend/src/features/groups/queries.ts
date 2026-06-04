import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Draw, Group, Member, Plan, PlanStatus, UserProfile } from '@/types';

export const groupsKeys = {
  all: ['groups'] as const,
  detail: (id: string) => ['groups', id] as const,
  members: (id: string) => ['groups', id, 'members'] as const,
  plans: (id: string, status?: PlanStatus) => ['groups', id, 'plans', status ?? 'all'] as const,
  draws: (id: string) => ['groups', id, 'draws'] as const,
  currentDraw: (id: string) => ['groups', id, 'draws', 'current'] as const,
  profile: (id: string) => ['users', id, 'profile'] as const,
};

export const useGroups = () =>
  useQuery({
    queryKey: groupsKeys.all,
    queryFn: async () => (await api.get<Group[]>('/groups')).data,
  });

export const useGroup = (id: string) =>
  useQuery({
    queryKey: groupsKeys.detail(id),
    queryFn: async () => (await api.get<Group>(`/groups/${id}`)).data,
    enabled: !!id,
  });

export const useCreateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Group>) => (await api.post<Group>('/groups', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: groupsKeys.all }),
  });
};

export const useJoinGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invite_code: string) =>
      (await api.post<Group>('/groups/join', { invite_code })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: groupsKeys.all }),
  });
};

export const usePlans = (groupId: string, status?: PlanStatus) =>
  useQuery({
    queryKey: groupsKeys.plans(groupId, status),
    queryFn: async () =>
      (await api.get<Plan[]>(`/groups/${groupId}/plans`, { params: { status } })).data,
    enabled: !!groupId,
  });

export const useCreatePlan = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      category?: string;
      image_url?: string;
    }) => (await api.post<Plan>(`/groups/${groupId}/plans`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId, 'plans'] }),
  });
};

export const useUpdatePlan = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      planId,
      ...payload
    }: {
      planId: string;
      title?: string;
      description?: string;
      category?: string;
      image_url?: string;
      completed?: boolean;
    }) => (await api.patch<Plan>(`/groups/${groupId}/plans/${planId}`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'plans'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'draws'] });
    },
  });
};

export const useMembers = (groupId: string) =>
  useQuery({
    queryKey: groupsKeys.members(groupId),
    queryFn: async () => (await api.get<Member[]>(`/groups/${groupId}/members`)).data,
    enabled: !!groupId,
  });

export const useUserProfile = (userId: string) =>
  useQuery({
    queryKey: groupsKeys.profile(userId),
    queryFn: async () => (await api.get<UserProfile>(`/users/${userId}/profile`)).data,
    enabled: !!userId,
  });

export const useCurrentDraw = (groupId: string) =>
  useQuery({
    queryKey: groupsKeys.currentDraw(groupId),
    queryFn: async () => (await api.get<Draw | null>(`/groups/${groupId}/draws/current`)).data,
    enabled: !!groupId,
  });

export const useDraws = (groupId: string) =>
  useQuery({
    queryKey: groupsKeys.draws(groupId),
    queryFn: async () => (await api.get<Draw[]>(`/groups/${groupId}/draws`)).data,
    enabled: !!groupId,
  });

export const useRevealDraw = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (drawId: string) =>
      (await api.post<Draw>(`/groups/${groupId}/draws/${drawId}/reveal`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId, 'draws'] }),
  });
};

export const useRunDrawNow = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post<Draw>(`/groups/${groupId}/draws/run-now`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId, 'draws'] }),
  });
};
