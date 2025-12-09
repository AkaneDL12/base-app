import { View, ViewProps } from 'react-native';
import { ReactNode } from 'react';

interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <View 
      className={`bg-white rounded-3xl shadow-lg p-6 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
