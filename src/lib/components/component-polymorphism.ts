export type AnyComponentProps = Record<never, never>;

type PolymorphicComponentProps<
    TExplicitProps extends AnyComponentProps,
    TAs extends React.ElementType<TMinimum>,
    TMinimum extends AnyComponentProps = AnyComponentProps,
> = TExplicitProps & { as?: TAs; render?: never } & Omit<
    React.ComponentProps<TAs>,
    (keyof TExplicitProps) | 'as' | 'render'
>;

function throwIfUsingRenderProp(props: { render?: unknown }) {
    if (props.render !== undefined) {
        throw new Error('The `render` prop is not supported. Use the `as` prop instead.');
    }
}

export { throwIfUsingRenderProp }
export type { PolymorphicComponentProps }
