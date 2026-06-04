export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
};

export type SelectionMode = 'global' | 'per_user';
export type MemberRole = 'admin' | 'member';
export type PlanStatus = 'active' | 'selected' | 'archived';

export type Group = {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  selection_mode: SelectionMode;
  picks_count: number;
  avoid_recent_months: number;
  autodraw_enabled: boolean;
  created_at: string;
  member_count: number;
  my_role: MemberRole | null;
};

export type Plan = {
  id: string;
  group_id: string;
  author: User;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  status: PlanStatus;
  completed_at: string | null;
  created_at: string;
};

export type DrawSelection = {
  id: string;
  plan: Plan;
  for_user: User | null;
};

export type Draw = {
  id: string;
  group_id: string;
  year: number;
  month: number;
  revealed: boolean;
  created_at: string;
  selections: DrawSelection[];
};

export type Member = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: MemberRole;
};

export type UserProfile = {
  user: User;
  shared_groups: { id: string; name: string; description: string | null }[];
  plans: Plan[];
  stats: { plans_created: number; times_selected: number };
};
