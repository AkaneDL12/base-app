import { Pressable, Text, PressableProps } from 'react-native';
import { forwardRef } from 'react';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button = forwardRef<typeof Pressable, ButtonProps>(
  ({ title, variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    const baseClasses = 'rounded-2xl items-center justify-center';

    const variantClasses = {
      primary: 'bg-violet-600 active:bg-violet-700',
      secondary: 'bg-violet-500 active:bg-violet-600',
      outline: 'bg-white border-2 border-gray-200 active:bg-gray-50',
    };

    const sizeClasses = {
      sm: 'py-3 px-4',
      md: 'py-4 px-5',
      lg: 'py-5 px-6',
    };

    const textVariantClasses = {
      primary: 'text-white',
      secondary: 'text-white',
      outline: 'text-gray-700',
    };

    const textSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    return (
      <Pressable
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        <Text className={`${textVariantClasses[variant]} ${textSizeClasses[size]} font-bold text-center`}>
          {title}
        </Text>
      </Pressable>
    );
  }
);

Button.displayName = 'Button';
