import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Plant database with more comprehensive information
const PLANT_DATABASE = [
  {
    id: 'aloe-vera',
    name: 'Aloe Vera',
    scientificName: 'Aloe barbadensis miller',
    conditions: ['burns', 'skin problems', 'digestive issues', 'inflammation', 'wound healing'],
    description: 'Succulent plant with gel-filled leaves known for skin healing properties',
    uses: ['Topical gel for burns', 'Digestive health', 'Anti-inflammatory'],
    confidence_keywords: ['burn', 'skin', 'cut', 'wound', 'heal', 'soothing', 'gel']
  },
  {
    id: 'turmeric',
    name: 'Turmeric',
    scientificName: 'Curcuma longa',
    conditions: ['inflammation', 'arthritis', 'digestive problems', 'infection', 'pain'],
    description: 'Golden spice with powerful anti-inflammatory and antioxidant properties',
    uses: ['Anti-inflammatory', 'Joint pain relief', 'Digestive aid'],
    confidence_keywords: ['inflammation', 'joint', 'pain', 'arthritis', 'turmeric', 'golden', 'spice']
  },
  {
    id: 'neem',
    name: 'Neem',
    scientificName: 'Azadirachta indica',
    conditions: ['skin infections', 'bacterial infections', 'fungal problems', 'diabetes', 'immune system'],
    description: 'Medicinal tree known as "village pharmacy" for its versatile healing properties',
    uses: ['Antibacterial', 'Antifungal', 'Blood sugar management'],
    confidence_keywords: ['infection', 'bacteria', 'fungal', 'skin', 'diabetes', 'blood sugar', 'immune']
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId } = await req.json();
    
    if (!query) {
      throw new Error('Query is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing AI query:', query);

    // Analyze query with OpenAI to extract health conditions and symptoms
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an herbal medicine expert. Analyze user health queries and recommend medicinal plants.
            
Available plants in database:
${PLANT_DATABASE.map(p => `${p.name} (${p.scientificName}): ${p.conditions.join(', ')}`).join('\n')}

Respond with a JSON object containing:
1. "conditions": array of identified health conditions
2. "recommendations": array of plant recommendations with:
   - "plantId": matching plant ID from database
   - "plantName": plant name
   - "confidence": 0.0-1.0 confidence score
   - "reasoning": why this plant is recommended
   - "usage": how to use the plant
   - "precautions": any warnings

IMPORTANT: Only recommend plants from the available database. Be conservative with confidence scores.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      }),
    });

    const analysisData = await analysisResponse.json();
    
    if (!analysisData.choices || !analysisData.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponse = analysisData.choices[0].message.content;
    console.log('AI Response:', aiResponse);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Failed to parse AI analysis');
    }

    // Calculate confidence scores based on keyword matching
    const enhancedRecommendations = parsedResponse.recommendations.map((rec: any) => {
      const plant = PLANT_DATABASE.find(p => p.id === rec.plantId || p.name === rec.plantName);
      if (!plant) return rec;

      // Calculate keyword-based confidence
      const queryLower = query.toLowerCase();
      const matchedKeywords = plant.confidence_keywords.filter(keyword => 
        queryLower.includes(keyword.toLowerCase())
      );
      
      const keywordConfidence = matchedKeywords.length / plant.confidence_keywords.length;
      
      // Combine AI confidence with keyword matching
      const finalConfidence = Math.min(0.95, (rec.confidence + keywordConfidence) / 2);

      return {
        ...rec,
        confidence: Math.round(finalConfidence * 100) / 100,
        matchedSymptoms: matchedKeywords
      };
    });

    // Sort by confidence
    enhancedRecommendations.sort((a: any, b: any) => b.confidence - a.confidence);

    // Store recommendation in database if user is logged in
    if (userId) {
      try {
        await supabase
          .from('plant_recommendations')
          .insert({
            user_id: userId,
            query_text: query,
            recommended_plants: enhancedRecommendations,
            ai_response: aiResponse
          });
      } catch (dbError) {
        console.error('Failed to store recommendation:', dbError);
        // Continue execution even if DB storage fails
      }
    }

    return new Response(JSON.stringify({
      query,
      conditions: parsedResponse.conditions,
      recommendations: enhancedRecommendations,
      disclaimer: "This is for educational purposes only. Always consult with healthcare professionals before using medicinal plants."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI suggestions:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process plant suggestions',
      query: query || 'unknown'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});