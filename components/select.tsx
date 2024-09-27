"use client";

import { useMemo } from "react";

import { SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";

import Icon from "./icon";

type Props = {
  onChange: (value?: string) => void;
  onCreate?: (value: string) => void;
  options?: { label: string; value: string; prop: string }[];
  value?: string | null | undefined;
  disabled?: boolean;
  placeholder?: string;
};

export default function Select({
  onChange,
  onCreate,
  options = [],
  value,
  disabled,
  placeholder,
}: Props) {
  const onSelect = (
    option: SingleValue<{ label: string; value: string; prop: string }>
  ) => {
    onChange(option?.value);
  };

  const formatedValue = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  const formatOptionLabel = ({
    label,
    prop,
  }: {
    label: string;
    prop?: string;
  }) => (
    <div className="flex items-center gap-2">
      {prop ? <Icon name={prop!} className="h-4 w-4 shrink-0" /> : ""}
      {label}
    </div>
  );

  return (
    <CreatableSelect
      isMulti={false}
      className="my-react-select-container h-10 text-sm"
      classNamePrefix="my-react-select"
      placeholder={placeholder}
      value={formatedValue}
      onChange={onSelect}
      options={options}
      onCreateOption={onCreate}
      isDisabled={disabled}
      formatOptionLabel={formatOptionLabel}
    />
  );
}
