/* istanbul ignore next */

// Handles situation if the sdk is loaded synchronously
window.ironSourceAtomInit = window.ironSourceAtomInit || function() {};

// Run this function on sdk async loading
window.ironSourceAtomInit();
