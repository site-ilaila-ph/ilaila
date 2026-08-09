/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context, FC, ReactNode } from "react";

declare type ContextProvider<T = unknown> = Context<T>['Provider'];
declare type ComposedProviderProps<TContexts> = 
    TContexts extends [Context<infer TProps>, ...infer TRest] ? TProps & ComposedProviderProps<TRest>
    : TContexts extends [Context<infer TProps>] ? TProps
    : TContexts extends [] ? Record<never, never>
    : never;
declare type ComposedProvider<TContexts> = FC<{ value: ComposedProviderProps<TContexts>, children: ReactNode | ReactNode[] }>;
declare function composeProviders<const TContexts extends Context<any>[]>(...contexts: TContexts): ComposedProvider<TContexts>;