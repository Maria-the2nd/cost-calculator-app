import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface ProjectRequestData {
  // Client info
  clientId: string;
  clientName: string;
  phcId: string;
  contactName: string;
  
  // Technical visit data
  visitMorada: string;
  visitCPostal: string;
  visitDays: number;
  visitNights: number;
  visitPeople: number;
  visitDaytimeHours: number;
  visitNighttimeHours: number;
  visitKilometers: number;
  visitAccommodation: boolean;
  visitMeals: number;
  visitExternalService: number;
  visitTotalCost: number;
  
  // Implementation data
  implMorada: string;
  implCPostal: string;
  implDays: number;
  implNights: number;
  implPeople: number;
  implDaytimeHours: number;
  implNighttimeHours: number;
  implKilometers: number;
  implAccommodation: boolean;
  implMeals: number;
  implExternalService: number;
  implTotalCost: number;
  
  // Total project cost
  projectTotalCost: number;
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json() as ProjectRequestData;
    const {
      // Client info
      clientId,
      clientName,
      phcId,
      contactName,
      
      // Technical visit data
      visitMorada,
      visitCPostal,
      visitDays,
      visitNights,
      visitPeople,
      visitDaytimeHours,
      visitNighttimeHours,
      visitKilometers,
      visitAccommodation,
      visitMeals,
      visitExternalService,
      visitTotalCost,
      
      // Implementation data
      implMorada,
      implCPostal,
      implDays,
      implNights,
      implPeople,
      implDaytimeHours,
      implNighttimeHours,
      implKilometers,
      implAccommodation,
      implMeals,
      implExternalService,
      implTotalCost,
      
      // Total project cost
      projectTotalCost
    } = requestData;

    // Generate a unique ID for this implementation
    const implementationId = uuidv4();

    // Insert implementation entry with all data
    const { error: implError } = await supabase
      .from('implementations')
      .insert({
        id: implementationId,
        project_id: null,
        location_type: 'internal',
        num_days: implDays,
        num_nights: implNights,
        num_people: implPeople,
        daytime_hours: implDaytimeHours,
        nighttime_hours: implNighttimeHours,
        kilometers: implKilometers,
        has_accommodation: implAccommodation,
        num_meals: implMeals,
        external_service_cost: implExternalService,
        calculated_daytime_cost: 0,
        calculated_nighttime_cost: 0,
        calculated_km_cost: 0,
        calculated_accommodation_cost: 0,
        calculated_meals_cost: 0,
        total_cost: projectTotalCost,
        
        // Client info fields
        client_name: clientName,
        phc_id: phcId,
        contact_name: contactName,
        
        // Technical visit fields
        visit_days: visitDays,
        visit_nights: visitNights,
        visit_people: visitPeople,
        visit_day_hours: visitDaytimeHours,
        visit_night_hours: visitNighttimeHours,
        visit_kilometers: visitKilometers,
        visit_accommodation: visitAccommodation,
        visit_meals: visitMeals,
        visit_external_service: visitExternalService,
        visit_total_cost: visitTotalCost,
        visit_morada: visitMorada,
        visit_c_postal: visitCPostal,
        
        // Implementation fields
        impl_days: implDays,
        impl_nights: implNights,
        impl_people: implPeople,
        impl_day_hours: implDaytimeHours,
        impl_night_hours: implNighttimeHours,
        impl_kilometers: implKilometers,
        impl_accommodation: implAccommodation,
        impl_meals: implMeals,
        impl_external_service: implExternalService,
        impl_total_cost: implTotalCost,
        impl_morada: implMorada,
        impl_c_postal: implCPostal,
        
        // Project total
        project_total_cost: projectTotalCost,
        
        // Timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (implError) {
      console.error('Error creating implementation:', implError);
      return NextResponse.json({ 
        success: false, 
        error: implError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      projectId: implementationId,
      message: 'Project data saved successfully' 
    });
  } catch (error: any) {
    console.error('Error in project creation:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
} 