import {
  FormikProvider,
  useField,
  useFormik,
  useFormikContext,
  FormikContextType,
  FormikHelpers,
} from 'formik';
import React from 'react';

interface DeclareMakeMutationFormParams<T extends {}> {
  inputs: T;
}

type InputsBase<InputMap extends {}> = {
  [K in keyof InputMap]: React.FC<InputMap[K]>;
};

type InputsType<MutationVariables, Inputs extends InputsBase<any>> = {
  [K in keyof Required<MutationVariables>]: React.FC<
    Parameters<
      Inputs[MutationFormConfig<Required<MutationVariables>, Inputs>[K]['type']]
    >[0]
  >;
};

export type ValidationFunction<V> = (
  values: V,
) => { [K in keyof V]?: string } | undefined;

/**
 * declareMakeMutationForm creates a function which you can
 * call in your project to help bootstrap forms. You pass in
 * a hash of inputs, which declare which form inputs
 * are available on this project.
 *
 * const makeMutationForm = declareMakeMutationForm({
 *   inputs: {
 *     text: (props) => <TextInput {...props} />,
 *     password: (props) => <TextInput {...props} type="password" />,
 *   },
 * })
 *
 * @deprecated - use useMutationForm instead
 */
export function declareMakeMutationForm<Inputs extends InputsBase<any>>({
  inputs,
}: DeclareMakeMutationFormParams<Inputs>) {
  interface MakeMutationFormParams<V extends {}, T extends {}> {
    config: MutationFormConfig<V, T>;
    validate?: ValidationFunction<V>;
    showErrorsOnTouched?: boolean;
  }
  /**
   * You can pass in a generic to makeMutationForm
   * to strongly type your form. For instance:
   *
   * type LoginFormVariables = {
   *   email: string;
   *   password: string;
   * }
   *
   * const LoginForm = makeMutationForm<LoginFormVariables>({ ... })
   *
   */
  return function makeMutationForm<MutationVariables extends {}>({
    config,
    validate: validateFromMakeMutationForm,
    showErrorsOnTouched,
  }: MakeMutationFormParams<MutationVariables, Inputs>): {
    Inputs: InputsType<MutationVariables, Inputs>;
    Wrapper: React.FC<MutationFormWrapperProps<MutationVariables>>;
    Consumer: React.FC<{
      children: React.FC<FormikContextType<MutationVariables>>;
    }>;
    useContext: () => FormikContextType<MutationVariables>;
  } {
    /**
     * Here, we declare a Wrapper which we'll use to
     * wrap the form, and pass in onSubmit, initialValues and validate.
     */
    const Wrapper: React.FC<MutationFormWrapperProps<MutationVariables>> = ({
      children,
      initialValues,
      onSubmit,
      validate: validateFromLocal,
      className,
      noFormTag = false,
    }) => {
      const formik = useFormik<MutationVariables>({
        initialValues: (initialValues || {}) as MutationVariables,
        onSubmit: (values, helpers) => {
          onSubmit(values, helpers);
        },
        validate: validateFromLocal || validateFromMakeMutationForm,
        enableReinitialize: true,
      });

      if (noFormTag) {
        return (
          <FormikProvider value={formik}>
            <div className={className}>{children}</div>
          </FormikProvider>
        );
      }

      return (
        /**
         * We wrap the form in a FormikProvider,
         * which means Formik can handle the form logic
         * and storing the state of the component.
         */
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className={className}>
            {children}
          </form>
        </FormikProvider>
      );
    };

    /**
     * Here, we transform the config you passed into
     * an object, where each key is a react component. With a login form,
     * passing email and password:
     *
     * <LoginForm.Inputs.email label="Email" />
     * <LoginForm.Inputs.password label="Password" />
     *
     * This is typed to the generic that you passed in to
     * makeMutationForm
     */
    const Inputs: InputsType<MutationVariables, Inputs> = Object.keys(
      config,
    ).reduce((obj, key) => {
      return {
        ...obj,
        [key]: (props: any) => {
          /** Pull out the type from the config we passed */
          const { type, ...configProps } = (config as any)[key];

          const Comp = inputs[type as keyof Inputs];
          /** Since we're using  */
          const [inputProps, metaProps] = useField(key);
          /**
           * We only show the error if the user has pressed
           * submit, or if the form input has been touched.
           */
          const { submitCount } = useFormikContext();
          let shouldShowError = submitCount > 0;
          if (showErrorsOnTouched) {
            shouldShowError = metaProps.touched || submitCount > 0;
          }
          return (
            // @ts-ignore
            <Comp
              {...inputProps}
              {...configProps}
              {...metaProps}
              error={shouldShowError ? metaProps.error : undefined}
              {...props}
            />
          );
        },
      };
    }, {} as any);

    const Consumer = function({
      children,
    }: {
      children: React.FC<FormikContextType<MutationVariables>>;
    }) {
      const formikProps = useFormikContext<MutationVariables>();
      return <>{children(formikProps)}</>;
    };

    const useFormContext = () => useFormikContext<MutationVariables>();

    return {
      Wrapper,
      Inputs,
      Consumer,
      useContext: useFormContext,
    };
  };
}

type MutationFormWrapperProps<V> = {
  className?: string;
  initialValues?: Partial<V>;
  onSubmit: (values: V, helpers: FormikHelpers<V>) => void;
  validate?: (values: V) => { [K in keyof V]?: string } | void;
  // Don't use a <form /> tag to wrap the form.
  noFormTag?: boolean;
};

export type MutationFormConfig<V, T> = {
  [K in keyof V]: {
    type: keyof T;
    label?: string;
    className?: string;
  };
};
