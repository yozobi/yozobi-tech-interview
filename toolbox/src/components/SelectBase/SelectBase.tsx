import classNames from 'classnames';
import React from 'react';
import Select, { Props } from 'react-select';
import styled from 'styled-components';
import InputLabel from '../InputLabel/InputLabel';

export const Label = styled.label`
  color: inherit;
  font-size: 1.125rem;
  font-weight: 600;
  display: block;
  margin-bottom: 0.4rem;
`;

export type SelectBaseProps<O> = {
  onChange?: (e: { target: { value: string | number; name?: string } }) => void;
  options: O[];
  valueAccessor: (option: O | undefined) => string | number;
  labelAccessor: (option: O) => string;
  label?: string;
  hint?: string;
  error?: string;
  labelClassname?: string;
  value: string | number;
  placeholder?: string;
  onInputChange?: (newValue: string) => void;
  SelectWrapper?: React.FC;
  theme?: Partial<Props['theme']>;
  styles?: Props['styles'];
} & Omit<Props<O>, 'onChange' | 'theme'>;

export function SelectBase<O>({
  onChange,
  options = [],
  value,
  label,
  hint,
  error,
  onBlur,
  valueAccessor,
  placeholder = 'Select...',
  labelAccessor,
  labelClassname,
  children,
  testID,
  theme,
  SelectWrapper = React.Fragment,
  ...props
}: SelectBaseProps<O>) {
  return (
    <div>
      <SelectWrapper>
        <Select<O>
          {...props}
          onChange={(option) =>
            onChange?.({
              target: { value: valueAccessor(option as O), name: props.name },
            })
          }
          isMulti={false}
          value={
            options.find((option) => valueAccessor(option as O) === value) ||
            null
          }
          defaultValue={
            props.defaultValue
              ? options.find(
                  (option) => valueAccessor(option as O) === props.defaultValue,
                )
              : undefined
          }
          theme={theme as any}
          placeholder={placeholder}
          options={options}
          getOptionLabel={labelAccessor}
          getOptionValue={valueAccessor as Props<O>['getOptionValue']}
        />
        {children}
      </SelectWrapper>
    </div>
  );
}

export default SelectBase;
