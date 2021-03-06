import { UseQueryArgs, UseQueryResponse, UseQueryState } from 'urql';
import { useState, useEffect } from 'react';
import { useThrottleUserInput } from './useThrottle';
export interface UseAsyncSearchSelectParams<V, Q, O> {
  /**
   * Pass in an urql useQuery. The hook uses this query to
   * go and grab the data
   */
  useQuery: (args: Omit<UseQueryArgs<V>, 'query'>) => UseQueryResponse<Q>;
  /**
   * Pass in a function to describe how to grab the options
   * from the graphQL query. For instance:
   *
   * resultAccessor: (result) => result.data?.CurrencyCloudAccounts || []
   */
  resultAccessor: (result: UseQueryState<Q>) => O[];
  /**
   * Pass in a function to describe how to turn the user's
   * search input (a string) into the variables that the query
   * above needs.
   *
   * makeVariablesFromInput: (inputText) => ({ search: inputText })
   */
  makeVariablesFromInput: (input: string) => V;
  /**
   * If you need the search input to start off with an initial option
   * selected, add it here
   */
  initialOption?: O;
  /**
   * If you want the search results to be pre-populated
   */
  allowEmptySearches?: boolean;
  valueAccessor: (option: any) => any;
}

/**
 * Packages up logic for an async select box
 *
 * Works well with the SelectBase component - allows
 * you to easily add async logic to it.
 */
export const useAsyncSearchSelect = <V, Q, O>({
  makeVariablesFromInput,
  resultAccessor,
  useQuery,
  initialOption,
  allowEmptySearches = true,
  valueAccessor,
}: UseAsyncSearchSelectParams<V, Q, O>) => {
  const [inputText, setInputText] = useState('');
  const [optionOverride, setOptionOverride] = useState<O[] | undefined>();
  const [hasChangedInput, setHasChangedInput] = useState(false);

  const [result] = useQuery({
    pause: !(allowEmptySearches && !hasChangedInput) && !inputText,
    variables: makeVariablesFromInput(inputText),
  });
  const { throttle, isThrottling } = useThrottleUserInput({
    throttleInMs: 200,
    allowInstantFirstTry: false,
  });
  useEffect(() => {
    if (inputText && optionOverride) {
      setOptionOverride(undefined);
    }
  }, [inputText]);
  const changeInput = (text: string) => {
    if (text !== inputText && !hasChangedInput) {
      setHasChangedInput(true);
    }
    throttle(() => setInputText(text));
  };
  const coercedInitialOption =
    initialOption && !hasChangedInput ? initialOption : undefined;
  const optionsFromQuery = resultAccessor(result);
  const options =
    optionOverride ||
    (coercedInitialOption || optionsFromQuery
      ? [
          // Include initial option
          ...(coercedInitialOption &&
          !optionsFromQuery?.find(
            (o) => valueAccessor(o) === valueAccessor(coercedInitialOption),
          )
            ? [coercedInitialOption]
            : []),
          ...(optionsFromQuery || []),
        ]
      : []);
  /**
   * Returns a set of props you can pass directly
   * to your SelectBase comp
   */
  return {
    /**
     * Clears the options of the select temporarily,
     * useful if you need to clear a value
     */
    clearOptions: () => {
      setInputText('');
      setOptionOverride([]);
    },
    inputText,
    isLoading: result.fetching || isThrottling,
    options,
    onInputChange: (text: string) => changeInput(text),
  };
};
