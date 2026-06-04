import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
export const groupsKeys = {
    all: ['groups'],
    detail: (id) => ['groups', id],
    members: (id) => ['groups', id, 'members'],
    plans: (id, status) => ['groups', id, 'plans', status ?? 'all'],
    draws: (id) => ['groups', id, 'draws'],
    currentDraw: (id) => ['groups', id, 'draws', 'current'],
    profile: (id) => ['users', id, 'profile'],
};
export const useGroups = () => useQuery({
    queryKey: groupsKeys.all,
    queryFn: async () => (await api.get('/groups')).data,
});
export const useGroup = (id) => useQuery({
    queryKey: groupsKeys.detail(id),
    queryFn: async () => (await api.get(`/groups/${id}`)).data,
    enabled: !!id,
});
export const useCreateGroup = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => (await api.post('/groups', payload)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: groupsKeys.all }),
    });
};
export const useJoinGroup = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (invite_code) => (await api.post('/groups/join', { invite_code })).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: groupsKeys.all }),
    });
};
export const usePlans = (groupId, status) => useQuery({
    queryKey: groupsKeys.plans(groupId, status),
    queryFn: async () => (await api.get(`/groups/${groupId}/plans`, { params: { status } })).data,
    enabled: !!groupId,
});
export const useCreatePlan = (groupId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => (await api.post(`/groups/${groupId}/plans`, payload)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId, 'plans'] }),
    });
};
export const useUpdatePlan = (groupId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ planId, ...payload }) => (await api.patch(`/groups/${groupId}/plans/${planId}`, payload)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['groups', groupId, 'plans'] });
            qc.invalidateQueries({ queryKey: ['groups', groupId, 'draws'] });
        },
    });
};
export const useMembers = (groupId) => useQuery({
    queryKey: groupsKeys.members(groupId),
    queryFn: async () => (await api.get(`/groups/${groupId}/members`)).data,
    enabled: !!groupId,
});
export const useUserProfile = (userId) => useQuery({
    queryKey: groupsKeys.profile(userId),
    queryFn: async () => (await api.get(`/users/${userId}/profile`)).data,
    enabled: !!userId,
});
export const useCurrentDraw = (groupId) => useQuery({
    queryKey: groupsKeys.currentDraw(groupId),
    queryFn: async () => (await api.get(`/groups/${groupId}/draws/current`)).data,
    enabled: !!groupId,
});
export const useDraws = (groupId) => useQuery({
    queryKey: groupsKeys.draws(groupId),
    queryFn: async () => (await api.get(`/groups/${groupId}/draws`)).data,
    enabled: !!groupId,
});
export const useRevealDraw = (groupId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (drawId) => (await api.post(`/groups/${groupId}/draws/${drawId}/reveal`)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId, 'draws'] }),
    });
};
export const useRunDrawNow = (groupId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => (await api.post(`/groups/${groupId}/draws/run-now`)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId, 'draws'] }),
    });
};
