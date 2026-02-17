import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/queryKeys';
import {
  clearAtlassianTokens,
  exchangeCodeForTokens,
  getAtlassianConfig,
  getAtlassianTokens,
  isJiraCloud,
  saveAtlassianConfig,
  saveAtlassianTokens,
  validateAndClearOAuthState,
  type AtlassianConfig,
} from '@/modules/settings/services/atlassian.service';

export function useAtlassianConfigQuery() {
  return useQuery({
    queryKey: queryKeys.atlassian.config,
    queryFn: getAtlassianConfig,
  });
}

export function useAtlassianConnectionQuery() {
  return useQuery({
    queryKey: queryKeys.atlassian.connection,
    queryFn: getAtlassianTokens,
  });
}

export function useSaveAtlassianConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: AtlassianConfig) => saveAtlassianConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.atlassian.config });
    },
  });
}

export function useClearAtlassianTokensMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clearAtlassianTokens(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.atlassian.connection });
      queryClient.invalidateQueries({ queryKey: queryKeys.atlassian.config });
    },
  });
}

interface OAuthCompleteVariables {
  code: string;
  state: string | null;
  config: AtlassianConfig;
}

export function useOAuthCompleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, state, config }: OAuthCompleteVariables) => {
      if (isJiraCloud(config.instanceUrl) && !validateAndClearOAuthState(state)) {
        throw new Error('Invalid OAuth state. Please try connecting again.');
      }
      const tokens = await exchangeCodeForTokens(code, config);
      await saveAtlassianTokens(tokens);
      return getAtlassianConfig();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.atlassian.config });
      queryClient.invalidateQueries({ queryKey: queryKeys.atlassian.connection });
    },
  });
}
