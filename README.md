# Cost Calculator Application Deployment Package

This package contains the complete Cost Calculator application with the following enhancements:

## New Features and Updates

1. **European Date Format (DD/MM/YYYY)** throughout the application
2. **Euro (€) Currency Format** for all monetary values
3. **Client Information**
   - Client name/selection field
   - PHCNumber (6 digits) field
   - New Supabase table "Clientes" with columns:
     - ID
     - PHCNumber
     - clientName
     - contactName
     - Adress
     - PostalCode

4. **Enhanced Total Cost Calculation**
   - "Custo Total do Projeto" field that automatically sums totals from both sections

## Deployment Instructions

### Prerequisites

1. Node.js 20.x or later
2. pnpm package manager
3. Supabase account with API keys

### Installation Steps

1. Extract the package:
   ```
   tar -xzvf cost-calculator.tar.gz -C /your/destination/folder
   ```

2. Install dependencies:
   ```
   cd /your/destination/folder
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env.local` file with the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database:
   - Run the SQL scripts in the `migrations` folder to create the necessary tables
   - The updated schema includes the new "Clientes" table

5. Build the application:
   ```
   pnpm build
   ```

6. Start the application:
   ```
   pnpm start
   ```

## Database Schema Updates

The updated database schema includes a new "Clientes" table with the following structure:

```sql
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY,
  phc_number VARCHAR(6) UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  contact_name TEXT,
  adress TEXT,
  postal_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Additional Information

- All monetary values are displayed in Euro (€) format
- Dates follow the European format (DD/MM/YYYY)
- The "Custo Total do Projeto" field automatically updates as values change in either section

For any questions or support, please refer to the documentation or contact the development team.
