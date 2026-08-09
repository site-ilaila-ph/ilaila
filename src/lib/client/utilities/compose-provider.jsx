function composeProviders(...contexts) {
    let fn = function({ children }) { return <>{children}</>; };
    
    for (let i = contexts.length - 1; i >= 0; i--) {
        const Provider = contexts[i].Provider;
        fn = function({ children, value }) { return <Provider value={value}>{ children }</Provider>; };
    }

    return fn;
}

export { composeProviders }