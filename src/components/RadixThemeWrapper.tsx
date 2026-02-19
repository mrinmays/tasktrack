import { Theme } from "@radix-ui/themes";
import { useTheme } from "@/hooks/useTheme";

interface RadixThemeWrapperProps {
  readonly children: React.ReactNode;
}

/**
 * Wraps children in Radix Theme, syncing appearance with our app theme.
 * Required for Radix Themes components (e.g. Callout).
 */
export function RadixThemeWrapper({ children }: RadixThemeWrapperProps) {
  const { theme } = useTheme();
  return (
    <Theme appearance={theme} radius="medium">
      {children}
    </Theme>
  );
}
