import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export const generateTicketPDF = async (order, event) => {
    // Create a temporary container for the ticket
    const ticketContainer = document.createElement('div');
    ticketContainer.style.position = 'absolute';
    ticketContainer.style.left = '-9999px';
    ticketContainer.style.width = '500px';
    ticketContainer.style.background = '#000000';
    ticketContainer.style.padding = '30px';
    ticketContainer.style.fontFamily = 'Arial, sans-serif';

    const icon = {
        calendar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-2px; margin-right:8px;"><path d="M7 2v2M17 2v2" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/><path d="M3 9h18" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/><path d="M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="#dc2626" stroke-width="2"/></svg>',
        clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-2px; margin-right:8px;"><path d="M12 8v5l3 2" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="#dc2626" stroke-width="2"/></svg>',
        pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-2px; margin-right:8px;"><path d="M12 22s7-4.5 7-12a7 7 0 1 0-14 0c0 7.5 7 12 7 12Z" stroke="#dc2626" stroke-width="2"/><path d="M12 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="#dc2626" stroke-width="2"/></svg>',
        city: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-2px; margin-right:8px;"><path d="M3 21h18" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/><path d="M5 21V7l7-4 7 4v14" stroke="#dc2626" stroke-width="2" stroke-linejoin="round"/><path d="M9 21v-6h6v6" stroke="#dc2626" stroke-width="2" stroke-linejoin="round"/></svg>'
    };

    ticketContainer.innerHTML = `
        <div style="background: #000000; border-radius: 15px; overflow: hidden; border: 1px solid #dc2626;">
            <!-- Header -->
            <div style="position: relative; height: 220px; overflow: hidden; background: #000;">
                <img src="${event.image}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.6;" />
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0, 0, 0, 1) 20%, transparent); padding: 25px;">
                    <h1 style="color: #fff; font-size: 24px; margin: 0; font-weight: bold;">${event.title}</h1>
                </div>
            </div>
            
            <!-- Ticket Body -->
            <div style="padding: 30px; background: #000000;">
                <!-- Event Details -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <div style="color: #666; font-size: 11px; margin-bottom: 5px; letter-spacing: 1px;">${icon.calendar}DATE</div>
                        <div style="color: #fff; font-size: 14px; font-weight: bold;">
                            ${new Date(event.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}
                        </div>
                    </div>
                    <div>
                        <div style="color: #666; font-size: 11px; margin-bottom: 5px; letter-spacing: 1px;">${icon.clock}HEURE</div>
                        <div style="color: #fff; font-size: 14px; font-weight: bold;">${event.time}</div>
                    </div>
                    <div>
                        <div style="color: #666; font-size: 11px; margin-bottom: 5px; letter-spacing: 1px;">${icon.pin}LIEU</div>
                        <div style="color: #fff; font-size: 14px; font-weight: bold;">${event.venue}</div>
                    </div>
                     <div>
                        <div style="color: #666; font-size: 11px; margin-bottom: 5px; letter-spacing: 1px;">${icon.city}VILLE</div>
                        <div style="color: #fff; font-size: 14px; font-weight: bold;">${event.city}</div>
                    </div>
                </div>
                
                <!-- Separator -->
                <div style="height: 1px; background: #dc2626; opacity: 0.5; margin: 20px 0;"></div>
                
                <!-- Customer Info -->
                <div style="margin-bottom: 25px;">
                    <div style="color: #dc2626; font-size: 13px; font-weight: bold; margin-bottom: 15px; letter-spacing: 1px;">CLIENT</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <div style="color: #666; font-size: 11px; margin-bottom: 3px;">Nom</div>
                            <div style="color: #fff; font-size: 14px;">${order.customerName}</div>
                        </div>
                        <div>
                            <div style="color: #666; font-size: 11px; margin-bottom: 3px;">Téléphone</div>
                            <div style="color: #fff; font-size: 14px;">${order.customerPhone}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Tickets -->
                <div style="margin-bottom: 25px;">
                    <div style="color: #dc2626; font-size: 13px; font-weight: bold; margin-bottom: 12px; letter-spacing: 1px;">BILLETS</div>
                    <div style="background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 8px; padding: 15px;">
                        ${order.tickets.map(ticket => `
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1a1a1a;">
                                <span style="color: #fff; font-size: 13px;">${ticket.quantity}x ${ticket.type}</span>
                                <span style="color: #dc2626; font-weight: bold; font-size: 13px;">${(ticket.price * ticket.quantity).toLocaleString()} CDF</span>
                            </div>
                        `).join('')}
                        <div style="display: flex; justify-content: space-between; padding: 10px 0 0 0; margin-top: 8px;">
                            <span style="color: #fff; font-weight: bold; font-size: 15px;">TOTAL</span>
                            <span style="color: #dc2626; font-weight: bold; font-size: 16px;">${order.totalAmount.toLocaleString()} CDF</span>
                        </div>
                    </div>
                </div>
                
                <!-- QR Code and Token -->
                <div style="display: flex; justify-content: space-between; align-items: center; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 8px; padding: 15px;">
                    <div>
                        <div style="color: #666; font-size: 11px; margin-bottom: 5px; letter-spacing: 1px;">TOKEN DE VALIDATION</div>
                        <div style="color: #fff; font-size: 20px; font-weight: bold; font-family: monospace; letter-spacing: 1px;">${order.token}</div>
                        <div style="color: #666; font-size: 10px; margin-top: 5px;">Ref: ${order._id.slice(-8)}</div>
                    </div>
                    <div id="qr-code-container" style="background: white; padding: 6px; border-radius: 4px;">
                        <!-- QR Code will be inserted here -->
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #1a1a1a;">
                    <div style="color: #666; font-size: 11px;">
                        Evan Lesnar • Présentation obligatoire à l'entrée
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(ticketContainer);

    // Generate QR code using qrcode library
    const qrContainer = ticketContainer.querySelector('#qr-code-container');
    const qrCanvas = document.createElement('canvas');

    await QRCode.toCanvas(qrCanvas, order._id, {
        width: 120,
        margin: 1,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });

    qrContainer.appendChild(qrCanvas);

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Convert to canvas
    const canvas = await html2canvas(ticketContainer, {
        scale: 2,
        backgroundColor: '#0f172a',
        logging: false,
        useCORS: true
    });

    // Create PDF
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Clean up
    document.body.removeChild(ticketContainer);

    // Download
    pdf.save(`Billet-${event.title.replace(/\s+/g, '-')}-${order.token}.pdf`);
};
