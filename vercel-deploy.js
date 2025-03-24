// This file is a marker for Vercel to ensure it deploys the latest version
console.log('Deploying latest version with timestamp:', new Date().toISOString());
console.log('Version: July 2024 (Rev. 2 - LATEST UPDATE - FORCED REBUILD)');

// Make sure environment variables are available
console.log('Checking environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (starts with ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + '...)' : 'Not set');
console.log('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Set' : 'Not set');

// Define fixed values to use if environment variables are missing 
const SUPABASE_URL = 'https://clolnikizfjkvhgjfxce.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsb2xuaWtpemZqa3ZoZ2pmeGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTkwMjMsImV4cCI6MjA1Nzk3NTAyM30.FxkqpedcFri4G2pJS_EVVlvJbhGKAHaNvtkCIftPfTo';

// Write out a metadata file for verification
const fs = require('fs');
const path = require('path');

const metadataContent = `
DEPLOYMENT_TIMESTAMP=${new Date().toISOString()}
HAS_SUPABASE_URL=${Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)}
HAS_SUPABASE_KEY=${Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)}
HAS_GOOGLE_MAPS_KEY=${Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)}
FIXED_SUPABASE_URL=${SUPABASE_URL}
`;

try {
  fs.writeFileSync(path.join(__dirname, 'public', 'vercel-metadata.txt'), metadataContent);
  console.log('Metadata file written successfully');
} catch (err) {
  console.error('Error writing metadata file:', err);
  // Try to create the public directory if it doesn't exist
  try {
    if (!fs.existsSync(path.join(__dirname, 'public'))) {
      fs.mkdirSync(path.join(__dirname, 'public'));
      fs.writeFileSync(path.join(__dirname, 'public', 'vercel-metadata.txt'), metadataContent);
      console.log('Created public directory and wrote metadata file');
    }
  } catch (mkdirErr) {
    console.error('Error creating public directory:', mkdirErr);
  }
} 