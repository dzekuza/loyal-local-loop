
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BusinessClaimRequest {
  business: {
    id: string;
    business_name: string;
    business_type: string;
    description?: string;
    logo?: string;
  };
  claimant: {
    email: string;
    firstName: string;
    lastName: string;
    message?: string;
  };
  claimId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business, claimant, claimId }: BusinessClaimRequest = await req.json();

    console.log('Processing business claim email:', {
      businessName: business.business_name,
      claimantEmail: claimant.email,
      claimId
    });

    const emailResponse = await resend.emails.send({
      from: "Loyable Business Claims <claims@loyable.app>",
      to: ["your-email@example.com"], // Replace with your actual email
      subject: `Business Claim: ${business.business_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
            New Business Claim Request
          </h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #e74c3c; margin-top: 0;">Business Details</h2>
            <p><strong>Business Name:</strong> ${business.business_name}</p>
            <p><strong>Business Type:</strong> ${business.business_type}</p>
            ${business.description ? `<p><strong>Description:</strong> ${business.description}</p>` : ''}
            <p><strong>Claim ID:</strong> ${claimId}</p>
          </div>

          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #27ae60; margin-top: 0;">Claimant Information</h2>
            <p><strong>Name:</strong> ${claimant.firstName} ${claimant.lastName}</p>
            <p><strong>Email:</strong> ${claimant.email}</p>
            ${claimant.message ? `
              <p><strong>Message:</strong></p>
              <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #27ae60;">
                ${claimant.message}
              </div>
            ` : ''}
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Next Steps:</strong></p>
            <ul style="margin: 10px 0;">
              <li>Review the claim details</li>
              <li>Contact the claimant at ${claimant.email}</li>
              <li>Verify business ownership</li>
              <li>Update claim status in the database</li>
            </ul>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
            <p>This email was generated automatically by the Loyable platform.</p>
            <p>Claim submitted on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    });

    console.log("Business claim email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-business-claim function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
