const Logger = {
  onActionDispatched(next, actionName, ...args) {
    if (args.length === 0) {
      console.log(`${ this.name }: "${ actionName }" dispatched`);
    } else {
      console.log(`${ this.name }: "${ actionName }" dispatched with payload ${ args }`);
    }
    next();
  },
  onStateChanged(next) {
    next();
    console.log(`${ this.name }: state changed to "${ this.state.name }"`);
  },
  onGeneratorStep(next, yielded) {
    console.log(`${ this.name }: generator step -> ${ yielded }`);
    next();
  }
}

export default Logger;