import { supabase } from './supabase';

/**
 * This script inserts default rate values into the database
 */
export async function setupRateValues() {
  console.log('Setting up rate values in the database...');
  
  try {
    // First, check if we have rate values
    const { data, error } = await supabase
      .from('rate_values')
      .select('*')
      .eq('is_current', true);
      
    if (error) {
      console.error('Error checking rate values:', error);
      return;
    }
    
    console.log(`Found ${data?.length || 0} rate values in the database`);
    
    // If we already have data, no need to insert
    if (data && data.length > 0) {
      console.log('Rate values already exist, no need to insert');
      return;
    }
    
    // Insert default rate values
    console.log('No rate values found, inserting defaults...');
    const { error: insertError } = await supabase
      .from('rate_values')
      .insert([
        { description: 'NHorasDiurnasVL', value: 50.00, currency: 'EUR', is_current: true },
        { description: 'NHorasNoturnaVL', value: 75.00, currency: 'EUR', is_current: true },
        { description: 'KmVL', value: 0.40, currency: 'EUR', is_current: true },
        { description: 'EstadiaVL', value: 150.00, currency: 'EUR', is_current: true },
        { description: 'NRefeicaoVL', value: 25.00, currency: 'EUR', is_current: true },
        { description: 'minimum_day', value: 100.00, currency: 'EUR', is_current: true },
        { description: '1periodoDia', value: 250.00, currency: 'EUR', is_current: true },
        { description: '1Dia', value: 500.00, currency: 'EUR', is_current: true },
        { description: 'minimum_night', value: 250.00, currency: 'EUR', is_current: true }
      ]);
      
    if (insertError) {
      console.error('Error inserting rate values:', insertError);
    } else {
      console.log('Successfully inserted default rate values');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// If this file is run directly
if (typeof require !== 'undefined' && require.main === module) {
  setupRateValues();
} 