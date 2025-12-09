import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useState } from 'react';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerClassName?: string;
}

export function Input({ label, error, containerClassName = '', ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={containerClassName}>
      <Text className="text-gray-700 mb-2 font-semibold text-sm ml-1">
        {label}
      </Text>
      <View className={`bg-gray-50 rounded-2xl border-2 ${isFocused ? 'border-violet-500' : error ? 'border-red-500' : 'border-transparent'}`}>
        <TextInput
          className="px-5 py-4 text-gray-800 text-base"
          placeholderTextColor="#9CA3AF"
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
