// Test file to isolate export issue
console.log('Testing exportUtils import...');

// Test 1: Import the whole module
try {
  import('./src/lib/exportUtils.ts').then(module => {
    console.log('✓ Module imported successfully');
    console.log('Available exports:', Object.keys(module));
    console.log('Has ExportFormat:', 'ExportFormat' in module);
  });
} catch (error) {
  console.error('✗ Module import failed:', error);
}

// Test 2: Import specific exports
try {
  import { ExportFormat } from './src/lib/exportUtils.ts';
  console.log('✓ ExportFormat imported successfully');
} catch (error) {
  console.error('✗ ExportFormat import failed:', error);
}