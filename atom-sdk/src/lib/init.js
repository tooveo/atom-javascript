/* istanbul ignore next */
// handle situation if user don`t init SDK
window.ironSourceAtomInit = window.ironSourceAtomInit || function() {
    console.error('Init IronSourceSDK!');
  };
// run user code after load sdk lib
window.ironSourceAtomInit();
