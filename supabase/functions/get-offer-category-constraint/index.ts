
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer les informations sur la contrainte de vérification
    const { data, error } = await supabaseClient
      .from('pg_constraint')
      .select('conname, consrc')
      .eq('conname', 'offers_category_check')
      .single();

    if (error) {
      // Si nous ne trouvons pas la contrainte spécifique, essayons d'obtenir toutes les contraintes pour la table offers
      const { data: allConstraints, error: allError } = await supabaseClient
        .rpc('get_table_constraints', { table_name: 'offers' });
      
      if (allError) throw allError;
      return new Response(JSON.stringify(allConstraints), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
