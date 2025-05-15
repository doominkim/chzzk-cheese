export function BatchOnly() {
  return function (_: any, __: string, { value }: PropertyDescriptor) {
    return {
      value: function (...args: any[]) {
        if (!process.env.IS_BATCH) return;
        return value.apply(this, args);
      },
    };
  };
}
