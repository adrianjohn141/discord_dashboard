interface ManualSnowflakeInputProps {
  name: string;
  label: string;
  defaultValue: string | null;
  placeholder: string;
  helperText: string;
}

export function ManualSnowflakeInput({
  name,
  label,
  defaultValue,
  placeholder,
  helperText,
}: ManualSnowflakeInputProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-white">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="control-input"
      />
      <p className="text-sm subtle-copy">{helperText}</p>
    </label>
  );
}
