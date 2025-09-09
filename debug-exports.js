// Debug file to check what's being exported
import * as exports from './src/lib/exportUtils.ts';

console.log('Available exports:', Object.keys(exports));
console.log('ExportFormat type available:', 'ExportFormat' in exports);