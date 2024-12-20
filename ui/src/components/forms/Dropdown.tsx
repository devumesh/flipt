import { Icon } from '~/types/Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '~/components/ui/dropdown-menu';
import { Fragment } from 'react';

import { ChevronDown, EllipsisVerticalIcon } from 'lucide-react';
import { Button, ButtonSize, ButtonVariant } from '~/components/ui/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const dropdownVariants = cva('', {
  variants: {
    variant: {
      default: 'text-secondary-foreground',
      destructive: 'text-destructive focus:bg-destructive focus:text-white'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

interface DropdownAction extends VariantProps<typeof dropdownVariants> {
  id: string;
  label: string;
  icon?: Icon;
  onClick: () => void;
  disabled?: boolean;
}

type DropdownProps = {
  label: string;
  actions: DropdownAction[];
  disabled?: boolean;
  side?: 'top' | 'bottom';
  kind?: 'dots';
  'data-testid'?: string;
};

export default function Dropdown(props: DropdownProps) {
  const { label, actions, disabled, side, kind } = props;
  let BtnIcon = ChevronDown;
  let variant: ButtonVariant = 'outline';
  let size: ButtonSize = 'default';

  if (kind === 'dots') {
    variant = 'ghost';
    size = 'icon';
    BtnIcon = EllipsisVerticalIcon;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          role="button"
          disabled={disabled}
          variant={variant}
          size={size}
          type="button"
          data-testid={props['data-testid']}
        >
          {label}
          <BtnIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={side || 'bottom'} key="actions">
        {actions.map((action, i) => (
          <Fragment key={i}>
            {action.variant === 'destructive' && i != 0 && (
              <DropdownMenuSeparator />
            )}

            <DropdownMenuItem
              onSelect={() => {
                if (!action.disabled) {
                  action.onClick();
                }
              }}
              disabled={action.disabled}
              className={cn(dropdownVariants({ variant: action.variant }))}
            >
              {action.icon && <action.icon aria-hidden="true" />}
              {action.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
