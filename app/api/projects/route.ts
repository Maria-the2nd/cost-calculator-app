import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const now = new Date().toISOString();
    
    // First, check if the client exists in the clients table
    const { data: existingClient, error: clientCheckError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', data.clientId)
      .single();
    
    // If client doesn't exist in the clients table, create it
    if (!existingClient || clientCheckError) {
      // Get client data from clientes table
      const { data: clientData, error: clientFetchError } = await supabase
        .from('clientes')
        .select('client_name, phc_number, contact_name')
        .eq('id', data.clientId)
        .single();
        
      if (clientFetchError) {
        console.error('Error fetching client data from clientes table:', clientFetchError);
        return NextResponse.json({ 
          success: false, 
          error: `Client not found: ${clientFetchError.message}` 
        }, { status: 500 });
      }
      
      // Insert client into clients table with the same ID
      const { error: clientInsertError } = await supabase
        .from('clients')
        .insert([{
          id: data.clientId,
          name: clientData.client_name,
          email: null,
          contact_number: null,
          created_at: now
        }]);
        
      if (clientInsertError) {
        console.error('Error inserting client to clients table:', clientInsertError);
        return NextResponse.json({ 
          success: false, 
          error: `Error creating client record: ${clientInsertError.message}` 
        }, { status: 500 });
      }
      
      console.log('Created client in clients table with ID:', data.clientId);
    }
    
    // Now create the project
    const projectId = uuidv4();
    console.log('Creating project with name:', data.projectName);
    
    const { error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          id: projectId,
          name: data.projectName, 
          client_id: data.clientId,
          created_at: now,
          updated_at: now,
          status: 'active'
        }
      ]);

    if (projectError) {
      console.error('Error creating project record:', projectError);
      return NextResponse.json({ 
        success: false, 
        error: `Error creating project: ${projectError.message}` 
      }, { status: 500 });
    }
    
    // Create implementation record
    console.log('Creating implementation record for project ID:', projectId);
    
    const { error: implError } = await supabase
      .from('implementations')
      .insert([
        {
          id: uuidv4(),
          project_id: projectId,
          location_type: data.implLocationType || 'internal',
          num_days: data.implDays || 1,
          num_nights: data.implNights || 0,
          num_people: data.implPeople || 1,
          daytime_hours: data.implDaytimeHours || 0,
          nighttime_hours: data.implNighttimeHours || 0,
          kilometers: data.implKilometers || 0,
          has_accommodation: data.implAccommodation || false,
          num_meals: data.implMeals || 0,
          external_service_cost: data.implExternalService || 0,
          calculated_daytime_cost: data.implDaytimeCost || 0,
          calculated_nighttime_cost: data.implNighttimeCost || 0,
          calculated_km_cost: data.implKmCost || 0,
          calculated_accommodation_cost: data.implAccommodationCost || 0,
          calculated_meals_cost: data.implMealsCost || 0,
          total_cost: data.implTotalCost || 0,
          created_at: now,
          updated_at: now
        }
      ]);

    if (implError) {
      console.error('Error inserting implementation:', implError);
      return NextResponse.json({ 
        success: false, 
        error: `Error creating implementation: ${implError.message}` 
      }, { status: 500 });
    }

    // Add technical visit data if present
    if (data.visitDays || data.visitDaytimeHours || data.visitNighttimeHours) {
      console.log('Adding technical visit data');
      
      const { error: visitError } = await supabase
        .from('technical_visits')
        .insert([
          {
            id: uuidv4(),
            project_id: projectId,
            location_type: data.visitLocationType || 'internal',
            num_days: data.visitDays || 1,
            num_nights: data.visitNights || 0,
            num_people: data.visitPeople || 1,
            daytime_hours: data.visitDaytimeHours || 0,
            nighttime_hours: data.visitNighttimeHours || 0,
            kilometers: data.visitKilometers || 0,
            has_accommodation: data.visitAccommodation || false,
            num_meals: data.visitMeals || 0,
            external_service_cost: data.visitExternalService || 0,
            calculated_daytime_cost: data.visitDaytimeCost || 0,
            calculated_nighttime_cost: data.visitNighttimeCost || 0,
            calculated_km_cost: data.visitKmCost || 0,
            calculated_accommodation_cost: data.visitAccommodationCost || 0,
            calculated_meals_cost: data.visitMealsCost || 0,
            total_cost: data.visitTotalCost || 0,
            created_at: now,
            updated_at: now
          }
        ]);

      if (visitError) {
        console.log('Warning: Error adding technical visit data:', visitError);
        // Continue execution even if technical visit fails
      }
    }

    return NextResponse.json({ success: true, projectId }, { status: 201 });
  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 