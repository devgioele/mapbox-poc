import { ChangeEventHandler, useState } from 'react';

type TextFieldProps = {
  label: string;
  content: string;
  onChange: (content: string) => void;
};

export default function TextField({
  label,
  content,
  onChange,
}: TextFieldProps) {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <label>
      {label}
      <input
        style={{ margin: '0px 10px' }}
        type="text"
        value={content}
        onChange={handleChange}
      />
    </label>
  );
}
