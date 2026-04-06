import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  // Dynamic import de Resend solo cuando se necesita
  let resend = null;
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
  
  if (resendApiKey) {
    try {
      const { Resend } = await import("resend");
      resend = new Resend(resendApiKey);
    } catch (e) {
      console.error("Failed to load Resend:", e);
    }
  }

  try {
    const data = await request.json();

    const { passengersInfo, contactInfo, cart } = data;

    console.log("Checkout API received:", { passengersInfo, contactInfo, cart });

    // Validar que tenemos los datos necesarios
    if (!cart || !cart.tourName || !cart.totalPrice) {
      console.error("Missing cart data");
      return new Response(JSON.stringify({ error: "Missing cart data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!contactInfo || !contactInfo.email) {
      console.error("Missing contact email");
      return new Response(JSON.stringify({ error: "Missing contact email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. Enviar Email con Resend solo si esta configurado
    if (resend && contactInfo.email) {
      try {
        const emailResult = await resend.emails.send({
           from: "Reservas Dreamy Tours <reservas@tudominio.com>", // Configura esto con un dominio verificado en Resend
           to: [contactInfo.email],
           bcc: ["info@dreamy.tours"], // Se enviará una copia a la agencia
           subject: `Reserva Confirmada: ${cart.tourName}`,
           html: `
             <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
               <h2>Detalles de la Reserva</h2>
               <p><strong>Tour:</strong> ${cart.tourName}</p>
               <p><strong>Fecha de Viaje:</strong> ${cart.date || 'Sin definir'}</p>
               <p><strong>Cantidad de Pasajeros:</strong> ${cart.passengers}</p>
               
               <h3>Detalles de Pago</h3>
               <p><strong>Monto Pagado a través de PayPal:</strong> US$${Number(cart.amountPaid).toFixed(2)} 
                 <em>(${cart.amountToPayLabel === 'minimum' ? 'Adelanto del 50%' : 'Pago Total'})</em>
               </p>
               <p><strong>Precio Total Original:</strong> US$${Number(cart.totalPrice).toFixed(2)}</p>

               <h3>Datos de Contacto Principales</h3>
               <ul style="list-style: none; padding: 0;">
                  <li><strong>Nombre Completo:</strong> ${contactInfo.firstname} ${contactInfo.lastname}</li>
                  <li><strong>Correo Electrónico:</strong> ${contactInfo.email}</li>
                  <li><strong>Teléfono / WhatsApp:</strong> ${contactInfo.phoneCode} ${contactInfo.phone}</li>
               </ul>

               <h3>Información de los Pasajeros (Travelers)</h3>
               <ul>
                 ${passengersInfo.map((p: any, i: number) => 
                   `<li style="margin-bottom: 12px; background: #f9f9f9; padding: 10px; border-radius: 6px;">
                      <strong style="color: #6d28d9;">Pasajero ${i + 1}:</strong> ${p.name} ${p.lastname}<br/>
                      <strong>Género:</strong> ${p.gender} | 
                      <strong>Fecha de Nacimiento:</strong> ${p.dob} | 
                      <strong>País Emisor:</strong> ${p.country}<br/>
                      <strong>${p.documentType}:</strong> ${p.documentNumber}
                   </li>`
                 ).join('')}
               </ul>
             </div>
           `
        });
        console.log("Resend email sent:", emailResult);
      } catch (emailError) {
        console.error("Resend Error:", emailError);
      }
    } else {
      console.log("Resend not configured, skipping email");
    }

    // 2. Armar la URL de PayPal
    // IMPORTANTE: Actualizar este correo al correo oficial de tu cuenta PayPal de negocio
    const businessEmail = "info@dreamy.tours"; 
    const itemName = encodeURIComponent(cart.tourName);
    const amount = cart.totalPrice.toFixed(2);
    const returnUrl = encodeURIComponent(`${new URL(request.url).origin}/checkout/success`);
    
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${businessEmail}&item_name=${itemName}&amount=${amount}&currency_code=USD&return=${returnUrl}`;

    console.log("PayPal URL generated:", paypalUrl);

    return new Response(JSON.stringify({ success: true, redirectUrl: paypalUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Checkout API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
