import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
  useState,
} from "react";
import type {
  ComponentPropsWithoutRef,
  ElementRef,
  ReactElement,
  ReactNode,
} from "react";
import * as RadixSelect from "@radix-ui/react-select";

function mergeClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export const Root = RadixSelect.Root;
export const Group = RadixSelect.Group;
export const Value = RadixSelect.Value;
export const Trigger = RadixSelect.Trigger;
export const Icon = RadixSelect.Icon;
export const Portal = RadixSelect.Portal;
export const Item = RadixSelect.Item;
export const ItemText = RadixSelect.ItemText;
export const ItemIndicator = RadixSelect.ItemIndicator;
export const Label = RadixSelect.Label;
export const Separator = RadixSelect.Separator;

function getTextContent(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getTextContent).join(" ");
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getTextContent(node.props.children);
  }
  return "";
}

function isSeparatorNode(node: ReactNode): boolean {
  return isValidElement(node) && node.type === RadixSelect.Separator;
}

function removeRedundantSeparators(nodes: ReactNode[]): ReactNode[] {
  const compact = nodes.filter((node) => node !== null);
  const result: ReactNode[] = [];

  for (const node of compact) {
    if (isSeparatorNode(node)) {
      const prev = result.at(-1);
      if (!prev || isSeparatorNode(prev)) {
        continue;
      }
    }
    result.push(node);
  }

  while (result.length > 0 && isSeparatorNode(result[0])) {
    result.shift();
  }
  while (result.length > 0 && isSeparatorNode(result[result.length - 1])) {
    result.pop();
  }
  return result;
}

function hasAnyItems(node: ReactNode): boolean {
  if (!node) {
    return false;
  }
  const nodes = Array.isArray(node) ? node : [node];
  for (const current of nodes) {
    if (!isValidElement<{ children?: ReactNode }>(current)) {
      continue;
    }
    if (current.type === RadixSelect.Item) {
      return true;
    }
    if (hasAnyItems(current.props.children)) {
      return true;
    }
  }
  return false;
}

function filterNodeByQuery(node: ReactNode, query: string): ReactNode {
  if (!isValidElement<{ children?: ReactNode; value?: string }>(node)) {
    return node;
  }

  if (node.type === RadixSelect.Item) {
    const value = node.props.value ?? "";
    if (value === "none" || value === "other") {
      return node;
    }
    const text = getTextContent(node.props.children).toLowerCase();
    return text.includes(query) ? node : null;
  }

  if (node.type === RadixSelect.Group) {
    const rawChildren = Children.toArray(node.props.children).map((child) =>
      filterNodeByQuery(child, query),
    );
    const filteredChildren = removeRedundantSeparators(rawChildren);
    if (!hasAnyItems(filteredChildren)) {
      return null;
    }
    return cloneElement(
      node as ReactElement<{ children?: ReactNode }>,
      undefined,
      filteredChildren,
    );
  }

  if (!node.props.children) {
    return node;
  }

  const rawChildren = Children.toArray(node.props.children).map((child) =>
    filterNodeByQuery(child, query),
  );
  const filteredChildren = removeRedundantSeparators(rawChildren);

  return cloneElement(
    node as ReactElement<{ children?: ReactNode }>,
    undefined,
    filteredChildren,
  );
}

export const Viewport = forwardRef<
  ElementRef<typeof RadixSelect.Viewport>,
  ComponentPropsWithoutRef<typeof RadixSelect.Viewport>
>(function Viewport({ className, ...props }, ref) {
  return (
    <RadixSelect.Viewport
      ref={ref}
      className={mergeClassNames(
        "max-h-[min(20rem,var(--radix-select-content-available-height))] overflow-y-auto p-1",
        className,
      )}
      {...props}
    />
  );
});

export const Content = forwardRef<
  ElementRef<typeof RadixSelect.Content>,
  ComponentPropsWithoutRef<typeof RadixSelect.Content> & {
    allowSearch?: boolean;
    searchPlaceholder?: string;
    emptyText?: string;
  }
>(function Content(
  {
    className,
    children,
    allowSearch = false,
    searchPlaceholder = "Search...",
    emptyText = "No options found",
    ...props
  },
  ref,
) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredChildren = useMemo(() => {
    if (!allowSearch || normalizedQuery.length === 0) {
      return children;
    }
    const filtered = Children.toArray(children).map((child) =>
      filterNodeByQuery(child, normalizedQuery),
    );
    return removeRedundantSeparators(filtered);
  }, [allowSearch, children, normalizedQuery]);

  const hasItems = hasAnyItems(filteredChildren);

  return (
    <RadixSelect.Content
      ref={ref}
      className={mergeClassNames(
        "z-[60] overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800",
        className,
      )}
      {...props}
    >
      {allowSearch && (
        <div className="border-b border-neutral-200 dark:border-neutral-700 p-1.5">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-900 outline-none focus:ring-1 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:ring-neutral-500"
            onKeyDown={(event) => event.stopPropagation()}
          />
        </div>
      )}
      {hasItems ? (
        filteredChildren
      ) : (
        <div className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400">
          {emptyText}
        </div>
      )}
    </RadixSelect.Content>
  );
});
